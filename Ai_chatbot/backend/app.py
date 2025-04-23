from flask import Flask , request , jsonify, send_file
from flask_cors import CORS

import os
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
import chromadb
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from langchain_community.llms import HuggingFacePipeline
import torch
#import whatsapp
from langchain_community.llms import Ollama
# import qrcode
# import firebase_admin
# from firebase_admin import credentials, firestore


app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://127.0.0.1:5500", "http://localhost:5500","http://localhost:5173", "http://127.0.0.1:5173"],  # Your React dev server 
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

CHROMA_PATH = "chroma"
DATA_PATH = "data"
PROMPT_TEMPLATE = """
You are an AI assistant. Use ONLY the context provided below to answer the question.

If the answer is not in the context, say "I don't have enough information."

Context:
{context}

---

Question: {question}
Answer:
"""

def get_embedding_function():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


# # Initialize Firebase Admin SDK
# cred = credentials.Certificate("whatsapp-chatbot-33551-firebase-adminsdk-fbsvc-ab7903f1b4.json")  # Replace with the path to your JSON file
# firebase_admin.initialize_app(cred)

# # Access Firestore
# db = firestore.client()

# def get_whatsapp_uid(user_id1):
#     try:
#         # Reference the 'phone_numbers' collection and 'whatsapp' document
#         doc_ref = db.collection('phone_numbers').document(user_id1)
#         doc = doc_ref.get()

#         # Check if the document exists
#         if doc.exists:
#             # Retrieve the UID from the document
#             data = doc.to_dict()
#             uid = data.get('uid')  # Replace 'uid' with the actual field name in your document

#             # Store the UID (example: save to a file or database)
#             with open('uid_storage.txt', 'w') as file:
#                 file.write(uid)

#             return jsonify({'message': 'UID retrieved and stored successfully', 'uid': uid}), 200
#         else:
#             return jsonify({'error': 'Document not found'}), 404
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

## whatsapp api
# @app.route("/send-whatsapp", methods=["POST"])
# def send_whatsapp():
#     data = request.get_json()
#     number = data.get("to")
#     message = data.get("message")

#     if not number or not message:
#         return jsonify({"error": "Missing number or message"}), 400

#     result = whatsapp.send_whatsapp_message(number, message)
#     return jsonify(result), 200


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
            chunk_overlap=200,
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


@app.route('/question_asked', methods=['POST'])
def question_asked():
    if request.content_type == 'application/x-www-form-urlencoded':
        # WhatsApp webhook request
        data = request.form
        query_text = data.get('Body')  # Message text from WhatsApp
        user_id = data.get('From')    # Sender's WhatsApp number
        # user_id = get_whatsapp_uid(user_id1)  # Get userId from WhatsApp number
        is_whatsapp = True
        print(data)
        print(query_text)
        print(user_id)
    else:
        # API request
        data = request.get_json()
        query_text = data.get('query')
        user_id = data.get('userId')
        is_whatsapp = False

 
    if not query_text:
        return jsonify({'error': 'No query provided'}), 400

    if not user_id:
        return jsonify({'error': 'No userId provided'}), 400

    print("behind of db")
    db = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=get_embedding_function()
    )
    print("ahead of db")
    validation_results = db.similarity_search_with_score(
        query="*",  # Dummy query to fetch all chunks
        k=1,  # Fetch only one result for validation
        filter={"userId": user_id}
    )
    print("validation results")
    print(validation_results)
    if not validation_results:
        return jsonify({'error': 'No matching document found for the given userId and documentId.'}), 404
    print("Validation results found")
    # Perform similarity search for the query
    results = db.similarity_search_with_score(
        query=query_text,
        k=5,
        filter={"userId": user_id}
    )
    print("ahead of similarity")
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

# @app.route('/generate_qr', methods=['GET'])
# def generate_qr():
#     try:
#         # Generate QR code with WhatsApp link
#         whatsapp_link = "https://wa.me/14155238886?text=Hi%2C%20I%20want%20to%20chat%20with%20the%20bot"

#         # Create QR code in memory
#         qr = qrcode.QRCode(
#             version=1,
#             error_correction=qrcode.constants.ERROR_CORRECT_L,
#             box_size=10,
#             border=4,
#         )
#         qr.add_data(whatsapp_link)
#         qr.make(fit=True)

#         # Create image in memory
#         img_io = BytesIO()
#         img = qr.make_image(fill_color="black", back_color="white")
#         img.save(img_io, 'PNG')
#         img_io.seek(0)

#         return send_file(
#             img_io, 
#             mimetype='image/png',
#             as_attachment=False
#         )

#     except Exception as e:
#         print(f"Error generating QR code: {str(e)}")  # Debug logging
#         return jsonify({'error': str(e)}), 500

def get_llm():
    return Ollama(model="mistral")

if __name__ == '__main__':  # Fix the main condition
    print("Starting Flask server...")
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)  # Enable debug mode for development
    except Exception as e:
        print(f"Error starting server: {e}")