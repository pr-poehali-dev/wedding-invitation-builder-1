import json
import os
import base64
import uuid
import boto3


def handler(event: dict, context) -> dict:
    """Загрузка аудиофайла в S3 для фоновой музыки свадебного сайта"""
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body") or "{}")
    audio_data = body.get("audio", "")
    content_type = body.get("contentType", "audio/mpeg")
    filename = body.get("filename", "track.mp3")

    if not audio_data:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "No audio data"}),
        }

    if "," in audio_data:
        audio_data = audio_data.split(",", 1)[1]

    audio_bytes = base64.b64decode(audio_data)

    ext = filename.rsplit(".", 1)[-1] if "." in filename else "mp3"
    safe_name = filename.rsplit(".", 1)[0][:40].replace(" ", "_")
    key = f"wedding-audio/{uuid.uuid4()}_{safe_name}.{ext}"

    access_key = os.environ["AWS_ACCESS_KEY_ID"]
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=access_key,
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=key, Body=audio_bytes, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"url": cdn_url, "filename": filename}),
    }
