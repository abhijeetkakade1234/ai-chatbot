from flask import Flask, request, jsonify, send_file
import requests
import json
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
from uuid import uuid4
from io import BytesIO
import tempfile
import qrcode
import firebase_admin
from firebase_admin import credentials, firestore
from langchain_community.document_loaders import PyPDFLoader
import chromadb
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from langchain_community.llms import HuggingFacePipeline
import torch

#from langchain_community.llms import Ollama
from langchain_ollama import OllamaLLM
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from twilio.rest import Client
from langdetect import detect
from transformers import pipeline
from deep_translator import GoogleTranslator



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
VERIFY_TOKEN ="EAAJgFkPEdowBOZBIQAXFSshAAZAHyRUT3h6CBPCPqZBo6AkZCEQKUs4A5oQbADGEhv1VWODSbVGZCCsKi1pvMSIS3O3T4aWOFpsXuZAjzjyHeZCOelr6NPGmAAo9nVt7QEjlT0xrGZCa4ssfgk1ZAQefXn5E4Fyu63Q4ersR9oYjD9KYhSNRwBkKcUtTyVCGQsE80SZAqMUuIUcdIrSoWUHJThG2mJReYak08njVLvTA1IBdAZD"
#VERIFY_TOKEN = "EAAJgFkPEdowBOZC1ZBZAnFZAj0dCsOj1DAZCjIxJ7ZAe3HwVb6KPIBvFBgZATj0vnRhrHXbm5d7wNWiZCbp8h5jwA9Kh1Nhcqu72uwbrhk3ivtS93g2zOzy9csYya1dNykydQHfZAA1NRCjggu8zjhHjJ1LcXwbFzTuYKYj6QnUrZA2hsZCt7hOT3kPU9lC2hEXl9ynTboB7Stz8Yn1u0ChSb5CdbhlGeOpno9weWFV9x2g260ZD"  # Replace with your actual token
# TWILIO_ACCOUNT_SID = "AC537a0dba7867468ea0dfa9ee1eed9a62"
# TWILIO_AUTH_TOKEN="614352836da9ca7c2ec5a7588a862c8d"
# TWILIO_PHONE_NUMBER='whatsapp:+19476004435'
# TWILIO_PHONE_NUMBER1=+19476004435
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


translation_pipelines = {}

translator_to_english = pipeline("translation", model="Helsinki-NLP/opus-mt-mul-en")


# def send_whatsapp_message(recipient_number, response_text):
#     # 1. Payload: This is the message body that Meta expects
#     payload = {
#         "messaging_product": "whatsapp",
#         "to": recipient_number,
#         "type": "text",
#         "text": {
#             "body": response_text
#         }
#     }

#     # 2. Headers: Contains the Bearer token for authorization
#     headers = {
#         "Authorization": f"Bearer {ACCESS_TOKEN}",
#         "Content-Type": "application/json"
#     }

#     try:
#         # 3. Sending POST request to WhatsApp API
#         response = requests.post(API_URL, headers=headers, json=payload)

#         # 4. Handling the response
#         if response.status_code == 200:
#             print("Message sent successfully")
#             return jsonify({'message': response_text}), 200
#         else:
#             print(f"Failed to send message: {response.text}")
#             return jsonify({'error': 'Failed to send WhatsApp message'}), 500

#     except Exception as e:
#         # 5. Error handling
#         print(f"Error: {str(e)}")
#         return jsonify({'error': 'Something went wrong'}), 500



def translate_to_english(text):
    return translator_to_english(text)[0]['translation_text']

def translate_from_english(text, target_lang):
    # Lazy load the model if not already loaded
    if target_lang not in translation_pipelines:
        model_name = f"Helsinki-NLP/opus-mt-en-{target_lang}"
        try:
            translation_pipelines[target_lang] = pipeline("translation", model=model_name)
        except Exception as e:
            print(f"Translation model for {target_lang} not found: {e}")
            return text  # fallback to English if no model

    translator = translation_pipelines[target_lang]
    return translator(text)[0]['translation_text']


def get_embedding_function():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )


#Initialize Firebase Admin SDK with proper error handling
try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    cred_path = os.path.join(current_dir, "config", "whatsapp-chatbot-33551-firebase-adminsdk-fbsvc-ab7903f1b4.json")
    
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully")
except FileNotFoundError:
    print("Error: Firebase credentials file not found")
    print(f"Expected path: {cred_path}")
    exit(1)
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    exit(1)

# def get_whatsapp_uid(user_id1):
#     try:
#         # Reference the 'phone_numbers' collection and 'whatsapp' document
#         doc_ref = db.collection('phone_numbers').document(user_id1)
#         doc = doc_ref.get()
#         print(user_id1)
#         print(doc)
#         data = doc.to_dict()
#         print(data)
#         # Check if the document exists
#         if doc.exists:
#             # Retrieve the UID from the document
#             print("inside")
#             print(data)
#             return data.get('uid')  # Return just the UID string
#         else:
#             return None  # Return None if document not found
#     except Exception as e:
#         print(f"Error getting WhatsApp UID: {str(e)}")
#         return None

def send_whatsapp_message(wa_id, message_text,PHONE_NUMBER_ID):
    print(wa_id)
    # print(message_text)
    # print(PHONE_NUMBER_ID)
    url = f"https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {VERIFY_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": wa_id,
        "type": "text",
        "text": {
            "body": message_text
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    print("Status:", response.status_code)
    #print("Response from WhatsApp API:", response.status_code, response.text)
    return response


def get_whatsapp_uid(user_id1):
    try:
        # Clean up WhatsApp number format
        
        print(f"\nProcessing WhatsApp number:")
        print(f"Original: {user_id1}")
       

        # Get document reference and snapshot
        doc_ref = db.collection('phone_numbers').document(user_id1)
        doc = doc_ref.get()

        # Print document details
        print("\nDocument Details:")
        print(f"Document ID: {doc.id}")
        print(f"Document Path: {doc_ref.path}")
        print(f"Document Exists: {doc.exists}")

        # Check existence before accessing data
        if doc.exists:
            data = doc.to_dict()
            print(f"\nDocument Data: {data}")
            uid = data.get('uid')
            if uid:
                print(f"Found UID: {uid}")
                return uid
            else:
                print("No UID field found in document")
                return None
        else:
            # print(f"\nNo document found for number: {clean_number}")
            return None

    except Exception as e:
        print(f"\nError getting WhatsApp UID: {str(e)}")
        return None
    

## whatsapp api
@app.route("/send-whatsapp", methods=["POST"])
def send_whatsapp():
    data = request.get_json()
    number = data.get("to")
    message = data.get("message")

    if not number or not message:
        return jsonify({"error": "Missing number or message"}), 400

    result = whatsapp.send_whatsapp_message(number, message)
    return jsonify(result), 200


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
        settings = chromadb.Settings(
            persist_directory=CHROMA_PATH,
            is_persistent=True
        )
        client = chromadb.Client(settings)
        
        db = Chroma(
            client=client,
            collection_name=f"user_{user_id}",
            embedding_function=get_embedding_function()
        )
        
        chunk_ids = [chunk.metadata["chunkId"] for chunk in chunks]
        db.add_documents(chunks, ids=chunk_ids)

        return {
            "userId": user_id,
            "documentId": document_id,
            "chunks_stored": len(chunks),
            "status": "processed"
        }
    finally:
        # Clean up the temporary file
        os.remove(temp_pdf_path)

# @app.route('/Whatsapp_asked',methods=['GET','POST'])
# def question_asked_whatsapp():
#     if request.method == 'GET':
#     # WhatsApp verification request     
#         if request.args.get('hub.verify_token') == VERIFY_TOKEN:
#             return request.args.get('hub.challenge')
#         else:
#             return "Invalid verification token", 403
#     elif request.method == 'POST':
#         try:
#             request_data = request.data.decode("utf-8")
#             data = json.loads(request_data)
#             user_id2 = data['entry'][0]['changes'][0]['value']['contacts'][0]['wa_id']
#             user_id1 = f'whatsapp:+{user_id2}'
#             user_id = get_whatsapp_uid(user_id1)
#             print(user_id1)
#             print("Incoming JSON:", request_data) 
#             query_text = data['entry'][0]['changes'][0]['value']['messages'][0]['text']['body']
#             is_whatsapp = True
            
#             if not query_text:
#                 return jsonify({'error': 'No query provided'}), 400

#             if not user_id:
#                 return jsonify({'error': 'No userId provided'}), 400
#             detected_lang = detect(query_text)
#             if detected_lang != 'en':
#                 print(f"Detected language: {detected_lang}")
#                 translated_text = GoogleTranslator(source=detected_lang, target='en').translate(query_text)
#                 query_text = translated_text


#             settings = chromadb.Settings(
#                 persist_directory=CHROMA_PATH,
#                 is_persistent=True
#             )
#             client = chromadb.Client(settings)
        
#         # Initialize Chroma with proper client
#             db = Chroma(
#                 client=client,
#                 collection_name=f"user_{user_id}",
#                 embedding_function=get_embedding_function()
#             )

#         # Perform similarity search
#             results = db.similarity_search_with_score(
#                 query=query_text,
#                 k=5,    
#                 filter={"userId": user_id}
#              )

#             if not results:
#                 return jsonify({'error': 'No relevant documents found'}), 404

#         # Generate response
#             context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
#             prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
#             prompt = prompt_template.format(context=context_text, question=query_text)

#             llm = get_llm()
#             try:
#                 print("out side of the llm")
#                 response = llm.invoke(prompt)
#                 # Ensure response is a string
#                 response_text = str(response).strip()
#                 print(response_text)  # Debug logging
#             except Exception as llm_error:
#                 print(f"LLM Error: {llm_error}")
#                 response_text = "I apologize, but I encountered an error processing your question."
#             # if detected_lang != 'en':
#             #     translated_text = GoogleTranslator(source='en', target=detected_lang).translate(response_text)
#             #     response_text = translated_text    
#             if detected_lang != 'en':
#                 response_text = GoogleTranslator(source='en', target=detected_lang).translate(response_text)
#             phone_number_id = data['entry'][0]['changes'][0]['value']['metadata']['phone_number_id']
#             send_whatsapp_message(user_id2, response_text, phone_number_id)
            
#             print("yes boss")
     
#         except Exception as e:
#             print(f"Error in question_asked: {str(e)}")
#             return jsonify({
#                 'error': 'An error occurred processing your request',
#                 'details': str(e)
#             }), 500     
#             return jsonify({'message': response_text}), 200


# @app.route('/question_asked', methods=['GET','POST'])
# def question_asked():
# #   if request.method == 'GET':
# #     # WhatsApp verification request     
# #     if request.args.get('hub.verify_token') == VERIFY_TOKEN:
# #         return request.args.get('hub.challenge')
# #     else:
# #         return "Invalid verification token", 403
# #   elif request.method == 'POST':
# #     try:
#         # if request.content_type == 'application/json':
#             # print("inside json")
#             # print(request.json)
#             # # WhatsApp webhook request
#             # data = request.form
#             # query_text = data.get('Body')  # Message text from WhatsApp
#             # whatsapp_number = data.get('From')    # Sender's WhatsApp number
#             # print(whatsapp_number)
#             # #Get userId from WhatsApp number
#             # user_id1 = get_whatsapp_uid(whatsapp_number)
#             # user_id = user_id1
#             # print(user_id)
#             # print(query_text)

#             # if not user_id:
#             #     return jsonify({'error': 'User not found'}), 404
                
#             #data = request.get_json()
#         #     request_data = request.data.decode("utf-8")
#         #     data = json.loads(request_data)
#         #     user_id2 = data['entry'][0]['changes'][0]['value']['contacts'][0]['wa_id']
#         #     user_id1 = f'whatsapp:+{user_id2}'
#         #     user_id = get_whatsapp_uid(user_id1)
#         #     print(user_id1)
#         #     print("Incoming JSON:", request_data) 
#         #     query_text = data['entry'][0]['changes'][0]['value']['messages'][0]['text']['body']
#         #     is_whatsapp = True
#         # else:
#             # Regular API request
#         data = request.get_json()
#         query_text = data.get('query')
#         user_id = data.get('userId')
#         is_whatsapp = False

#         if not query_text:
#             return jsonify({'error': 'No query provided'}), 400

#         if not user_id:
#             return jsonify({'error': 'No userId provided'}), 400
        
#         detected_lang = detect(query_text)
#         if detected_lang != 'en':
#             print(f"Detected language: {detected_lang}")
#             translated_text = GoogleTranslator(source=detected_lang, target='en').translate(query_text)
#             query_text = translated_text


#         settings = chromadb.Settings(
#             persist_directory=CHROMA_PATH,
#             is_persistent=True
#         )
#         client = chromadb.Client(settings)
        
#         # Initialize Chroma with proper client
#         db = Chroma(
#             client=client,
#             collection_name=f"user_{user_id}",
#             embedding_function=get_embedding_function()
#         )

#         # Perform similarity search
#         results = db.similarity_search_with_score(
#             query=query_text,
#             k=5,
#             filter={"userId": user_id}
#         )

#         if not results:
#             return jsonify({'error': 'No relevant documents found'}), 404

#         # Generate response
#         context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
#         prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
#         prompt = prompt_template.format(context=context_text, question=query_text)

#         llm = get_llm()
#         try:
#             print("out side of the llm")
#             response = llm.invoke(prompt)
#             # Ensure response is a string
#             response_text = str(response).strip()
#             print(response_text)  # Debug logging
#         except Exception as llm_error:
#             print(f"LLM Error: {llm_error}")
#             response_text = "I apologize, but I encountered an error processing your question."
#         # if detected_lang != 'en':
#         #     translated_text = GoogleTranslator(source='en', target=detected_lang).translate(response_text)
#         #     response_text = translated_text    
#         if detected_lang != 'en':
#               response_text = GoogleTranslator(source='en', target=detected_lang).translate(response_text)
#               print('ji')
#         # # Format response based on request type
#         # if is_whatsapp:
#         #     print("inside whatsapp")
#         #     # whatsapp_number1=user_id1.replace('whatsapp:', '')
#         #     # twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
#         #     # print(TWILIO_PHONE_NUMBER)
#         #     # print(whatsapp_number)
#         #     # try:
#         #     #     twilio_client.messages.create(
#         #     #         body=response_text,
#         #     #         from_=TWILIO_PHONE_NUMBER,  # Your Twilio number
#         #     #         to=whatsapp_number  # The sender's number
#         #     #     )
#         #     #     return jsonify({'message': response_text}), 200
#         #     # except Exception as e:
#         #     #     print(f"Error sending WhatsApp message: {str(e)}")
#         #     #     return jsonify({'error': 'Failed to send WhatsApp message'}), 500   
#         #     phone_number_id = data['entry'][0]['changes'][0]['value']['metadata']['phone_number_id']
#         #     send_whatsapp_message(user_id2, response_text, phone_number_id)
            
#         #     print("yes boss")
#         #     return jsonify({'message': response_text}), 200
#         # else:
#         return jsonify({
#             'response': response_text,
#                 # 'sources': [{'id': doc.metadata.get("chunkId", "unknown"), 
#                 #            'content': doc.page_content[:200] + "..."} 
#                 #           for doc, _score in results]
#         }), 200

#     except Exception as e:
#         print(f"Error in question_asked: {str(e)}")
#         return jsonify({
#             'error': 'An error occurred processing your request',
#             'details': str(e)
#         }), 500

@app.route('/Whatsapp_asked', methods=['GET', 'POST'])
def question_asked_whatsapp():
    print("inside whatsapp")
    if request.method == 'GET':
        # WhatsApp verification request     
        if request.args.get('hub.verify_token') == VERIFY_TOKEN:
            return request.args.get('hub.challenge')
        else:
            return "Invalid verification token", 403
    elif request.method == 'POST':
        try:
            request_data = request.data.decode("utf-8")
            data = json.loads(request_data)
            user_id2 = data['entry'][0]['changes'][0]['value']['contacts'][0]['wa_id']
            user_id1 = f'whatsapp:+{user_id2}'
            user_id = get_whatsapp_uid(user_id1)
            print(user_id1)
            print("Incoming JSON:", request_data) 
            query_text = data['entry'][0]['changes'][0]['value']['messages'][0]['text']['body']
            is_whatsapp = True

            if not query_text:
                return jsonify({'error': 'No query provided'}), 400
            if not user_id:
                return jsonify({'error': 'No userId provided'}), 400

            detected_lang = detect(query_text)
            if detected_lang != 'en':
                print(f"Detected language: {detected_lang}")
                query_text = GoogleTranslator(source=detected_lang, target='en').translate(query_text)

            settings = chromadb.Settings(persist_directory=CHROMA_PATH, is_persistent=True)
            client = chromadb.Client(settings)

            db = Chroma(
                client=client,
                collection_name=f"user_{user_id}",
                embedding_function=get_embedding_function()
            )

            results = db.similarity_search_with_score(query=query_text, k=5, filter={"userId": user_id})

            if not results:
                return jsonify({'error': 'No relevant documents found'}), 404

            context_text = "\n\n---\n\n".join([doc.page_content for doc, _ in results])
            prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
            prompt = prompt_template.format(context=context_text, question=query_text)

            llm = get_llm()
            try:
                print("outside of the llm")
                response = llm.invoke(prompt)
                response_text = str(response).strip()
                print(response_text)
            except Exception as llm_error:
                print(f"LLM Error: {llm_error}")
                response_text = "I apologize, but I encountered an error processing your question."

            if detected_lang != 'en':
                response_text = GoogleTranslator(source='en', target=detected_lang).translate(response_text)

            phone_number_id = data['entry'][0]['changes'][0]['value']['metadata']['phone_number_id']
            send_whatsapp_message(user_id2, response_text, phone_number_id)

            return jsonify({'message': response_text}), 200

        except Exception as e:
            print(f"Error in question_asked_whatsapp: {str(e)}")
            return jsonify({
                'error': 'An error occurred processing your request',
                'details': str(e)
            }), 500


@app.route('/question_asked', methods=['POST'])
def question_asked():
    try:
        data = request.get_json()
        query_text = data.get('query')
        user_id = data.get('userId')
        
        if not query_text:
            return jsonify({'error': 'No query provided'}), 400
        if not user_id:
            return jsonify({'error': 'No userId provided'}), 400

        detected_lang = detect(query_text)
        if detected_lang != 'en':
            print(f"Detected language: {detected_lang}")
            query_text = GoogleTranslator(source=detected_lang, target='en').translate(query_text)

        settings = chromadb.Settings(persist_directory=CHROMA_PATH, is_persistent=True)
        client = chromadb.Client(settings)

        db = Chroma(
            client=client,
            collection_name=f"user_{user_id}",
            embedding_function=get_embedding_function()
        )

        results = db.similarity_search_with_score(query=query_text, k=5, filter={"userId": user_id})

        if not results:
            return jsonify({'error': 'No relevant documents found'}), 404

        context_text = "\n\n---\n\n".join([doc.page_content for doc, _ in results])
        prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
        prompt = prompt_template.format(context=context_text, question=query_text)

        llm = get_llm()
        try:
            print("outside of the llm")
            response = llm.invoke(prompt)
            response_text = str(response).strip()
            print(response_text)
        except Exception as llm_error:
            print(f"LLM Error: {llm_error}")
            response_text = "I apologize, but I encountered an error processing your question."

        if detected_lang != 'en':
            response_text = GoogleTranslator(source='en', target=detected_lang).translate(response_text)

        return jsonify({'response': response_text}), 200

    except Exception as e:
        print(f"Error in question_asked: {str(e)}")
        return jsonify({
            'error': 'An error occurred processing your request',
            'details': str(e)
        }), 500


@app.route('/generate_qr', methods=['GET'])
def generate_qr():
    try:
        # Generate QR code with WhatsApp link
        whatsapp_link = "https://wa.me/+15551723208?text=Hi%2C%20I%20want%20to%20chat%20with%20the%20bot"

        # Create QR code in memory
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(whatsapp_link)
        qr.make(fit=True)

        # Create image in memory
        img_io = BytesIO()
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(img_io, 'PNG')
        img_io.seek(0)

        return send_file(
            img_io, 
            mimetype='image/png',
            as_attachment=False
        )

    except Exception as e:
        print(f"Error generating QR code: {str(e)}")  # Debug logging
        return jsonify({'error': str(e)}), 500


def get_llm():
    print("in llm")
    return OllamaLLM(
        model="mistral",
        temperature=0.7,
        format="",  # Ensure text format output
        callback_manager=None  # Disable callbacks to prevent _type issues
    )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
    #app.run(debug=True)