from fastapi import FastAPI, UploadFile, Body, HTTPException
from typing import Annotated
from llama_index.core import VectorStoreIndex, Document, Settings, get_response_synthesizer
from llama_index.llms.openai import OpenAI
from llama_index.core import get_response_synthesizer
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor

import unstructured_client
from unstructured_client.models import operations, shared

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",
]

import os

client = unstructured_client.UnstructuredClient(
    api_key_auth=os.getenv("UNSTRUCTURED_FREE_API_KEY"),
    server_url="https://api.unstructured.io/general/v0/general",
)

MODEL = "gpt-4o-mini"
Settings.llm = OpenAI(model=MODEL)

ABSTRACT =  {
    "title": "summary",
    "query": "Based on the abstract of the research paper, summarize the paper for a high-school senior"
}

PROBLEM = {
    "title": "problem",
    "query": "What is the core problem or research question the authors hope to address with this research?"
}

ADVANCEMENTS = {
    "title": "contributions",
    "query": "What are the notable contributions this paper is claiming to contribute to the field?"
}

FINDINGS = {
    "title": "findings",
    "query": "What were the key findings of the paper, and what are the implications of this?"
}

METHODS = {
    "title": "methods",
    "query": "If the authors built something, describe how it works under the hood as if to a second-year CS undergrad. If the authors did not create anything, answer N/A"
}

RESULTS = {
    "title": "results",
    "query": "What experiments did authors run and what were the results of each?"
}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def index():
    return "Hello world!"

@app.post("/papers/")
async def upload(file: UploadFile):    
    data = await file.read()
    if file.filename is None:
        raise HTTPException(status_code=400, detail="Filename is none")
 
    req = operations.PartitionRequest(
    partition_parameters=shared.PartitionParameters(
        files=shared.Files(
            content=data,
            file_name=file.filename
        ),
        strategy=shared.Strategy.HI_RES,
        languages=['eng'],
        chunking_strategy=shared.ChunkingStrategy.BY_TITLE
        ),
    )

    res = client.general.partition(request=req)
    if res.elements is None:
        raise ValueError

    elements = [el["text"] for el in res.elements] 
    documents = [Document(text=text) for text in elements]
    vector_index = VectorStoreIndex.from_documents(documents)

    def generate_response(query):
        retriever = VectorIndexRetriever(
            index=vector_index,
            similarity_top_k=10,
        )
        
        response_synthesizer = get_response_synthesizer()

        # assemble query engine
        query_engine = RetrieverQueryEngine(
            retriever=retriever,
            response_synthesizer=response_synthesizer,
            node_postprocessors=[SimilarityPostprocessor(similarity_cutoff=0.5)],
        )

        # query
        response = query_engine.query(query)
        return response.response


    questions = [ABSTRACT, PROBLEM, ADVANCEMENTS, FINDINGS, METHODS, RESULTS]

    response = {}

    for question in questions:
        response[question['title']] = generate_response(query=question["query"])

    return({
        'body': response
    }) 

