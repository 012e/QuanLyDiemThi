# Use an official Python runtime as a parent image
FROM python:3.10-alpine

WORKDIR /app

# Add the current directory files (on your machine) to the container
COPY ./requirements.txt /app/
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

# Start the server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
