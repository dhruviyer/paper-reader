FROM python:3.12-bookworm

WORKDIR /code

COPY ./requirements.txt /code/

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY backend.py /code/

EXPOSE 8000

CMD ["fastapi", "run", "backend.py", "--port", "8000"]