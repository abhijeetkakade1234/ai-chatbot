from flask import Flask , request , jsonify

import os
import shutil
import shutil
from typing import List
from langchain_community.embeddings.ollama import OllamaEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms import HuggingFacePipeline
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline
from uuid import uuid4  # For generating unique document IDs
from io import BytesIO  # For handling file streams
import tempfile
from langchain_community.document_loaders import PyPDFLoader

app=Flask(__name__)

CHROMA_PATH = "chroma"
DATA_PATH = "data"
PROMPT_TEMPLATE = """
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""
def get_embedding_function():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


@app.route('/push_user_info_database',methods=['POST'])
def push_user_info_database():
    if 'file' not in request.files:
        return jsonify({'error':'No file part in the request'}),400
    
    file=request.files['file']
    user_id=request.form.get('userId')

    if not user_id:
        return jsonify({'error':'No userId provided'}),400
    
    if file.filename=="":
        return jsonify({'error':'No selected file'}),400


    if file:
         # Read the PDF file content into memory
        file_stream = BytesIO(file.read())

        # Use PyPDFLoader to load the PDF file
       
        result=process_file_with_ml(file_stream,user_id)

        return jsonify({'message':'file processed successfully'}),200
    else:
        return jsonify({'error':'Invalid file'}),400
    


def process_file_with_ml(file_stream, user_id):
    # Generate a unique document ID for this document
    document_id = str(uuid4())

    # Save the in-memory file (BytesIO) to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
        temp_pdf.write(file_stream.read())
        temp_pdf_path = temp_pdf.name  # Get the path of the temporary file

    try:
        # Use PyPDFLoader to load the PDF file from the temporary file path
        loader = PyPDFLoader(temp_pdf_path)
        documents = loader.load()

        # Split the documents into chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=80,
            length_function=len,
            is_separator_regex=False
        )
        chunks = splitter.split_documents(documents)

        # Assign unique IDs to chunks
        for index, chunk in enumerate(chunks):
            chunk.metadata["userId"] = user_id
            chunk.metadata["documentId"] = document_id
            chunk.metadata["chunkId"] = f"{document_id}:{index}"

        # Store the chunks in the Chroma database
        db = Chroma(
            persist_directory=CHROMA_PATH,
            embedding_function=get_embedding_function()
        )
        chunk_ids = [chunk.metadata["chunkId"] for chunk in chunks]
        db.add_documents(chunks, ids=chunk_ids)
        db.persist()

        return {
            "userId": user_id,
            "documentId": document_id,
            "chunks_stored": len(chunks),
            "status": "processed"
        }
    finally:
        # Clean up the temporary file
        os.remove(temp_pdf_path)

@app.route('/question_asked',methods=['POST'])
def question_asked():
    data=request.get_json()
    query_text = data.get('query')
    user_id = data.get('userId')
 
    if not query_text:
        return jsonify({'error': 'No query provided'}), 400

    if not user_id:
        return jsonify({'error': 'No userId provided'}), 400


    db = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=get_embedding_function()
    )

    validation_results = db.similarity_search_with_score(
        query_text="*",  # Dummy query to fetch all chunks
        k=1,  # Fetch only one result for validation
        filter={"userId": user_id}
    )

    if not validation_results:
        return jsonify({'error': 'No matching document found for the given userId and documentId.'}), 404

    # Perform similarity search for the query
    results = db.similarity_search_with_score(
        query_text,
        k=5,
        filter={"userId": user_id}
    )

    if not results:
        return jsonify({'error': 'No relevant documents found in the database.'}), 404

    # Prepare the context from the top results
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)

    # Generate an answer using the LLM
    llm = get_llm()
    response_text = llm.invoke(prompt)

    # Collect source document IDs
    sources = [doc.metadata.get("chunkId", "unknown") for doc, _score in results]

    return jsonify({
        'response': response_text,
        'sources': sources
    }), 200



def get_llm():
    """
    Initialize and return a Hugging Face pipeline for text generation.
    """
    model_id = "google/flan-t5-base"  # You can replace this with another model if needed
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
    pipe = pipeline("text2text-generation", model=model, tokenizer=tokenizer, max_new_tokens=256)
    return HuggingFacePipeline(pipeline=pipe)


if __name__ == '__main__':
    app.run(debug=True)