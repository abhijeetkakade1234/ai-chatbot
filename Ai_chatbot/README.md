# Navigate to project root
cd d:\ai chatbot\Ai_chatbot

# Build the image
docker build -t ai-chatbot .

# Run the container with volume mounts
docker run -p 80:80 -p 5000:5000 `
  -v ${PWD}/backend/data:/app/backend/data `
  -v ${PWD}/backend/chroma:/app/backend/chroma `
  -v ${PWD}/backend/config:/app/backend/config `
  ai-chatbot