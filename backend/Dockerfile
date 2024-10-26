# Use an official Python runtime as a parent image
FROM python:3.10-alpine

WORKDIR /app

# Add the current directory files (on your machine) to the container
COPY ./requirements.txt /app/
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

RUN python manage.py makemigrations score_manager
RUN python manage.py migrate
RUN python manage.py initsuperuser
RUN python manage.py seed

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
