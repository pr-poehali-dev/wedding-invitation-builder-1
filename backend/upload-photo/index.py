import json
import os
import base64
import uuid
import hashlib
import hmac
import datetime
import urllib.request
import urllib.error

def _sign(key, msg):
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()

def _get_signature_key(secret, date_stamp, region, service):
    k_date = _sign(("AWS4" + secret).encode("utf-8"), date_stamp)
    k_region = _sign(k_date, region)
    k_service = _sign(k_region, service)
    k_signing = _sign(k_service, "aws4_request")
    return k_signing

def upload_to_s3(image_bytes: bytes, key: str, content_type: str) -> str:
    access_key = os.environ["AWS_ACCESS_KEY_ID"]
    secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]
    bucket = "files"
    endpoint = "bucket.poehali.dev"
    region = "us-east-1"
    service = "s3"

    t = datetime.datetime.utcnow()
    amzdate = t.strftime("%Y%m%dT%H%M%SZ")
    datestamp = t.strftime("%Y%m%d")

    canonical_uri = f"/{bucket}/{key}"
    canonical_querystring = ""
    payload_hash = hashlib.sha256(image_bytes).hexdigest()

    canonical_headers = (
        f"content-type:{content_type}\n"
        f"host:{endpoint}\n"
        f"x-amz-content-sha256:{payload_hash}\n"
        f"x-amz-date:{amzdate}\n"
    )
    signed_headers = "content-type;host;x-amz-content-sha256;x-amz-date"

    canonical_request = "\n".join([
        "PUT", canonical_uri, canonical_querystring,
        canonical_headers, signed_headers, payload_hash,
    ])

    credential_scope = f"{datestamp}/{region}/{service}/aws4_request"
    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256", amzdate, credential_scope,
        hashlib.sha256(canonical_request.encode("utf-8")).hexdigest(),
    ])

    signing_key = _get_signature_key(secret_key, datestamp, region, service)
    signature = hmac.new(signing_key, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    authorization = (
        f"AWS4-HMAC-SHA256 Credential={access_key}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )

    url = f"https://{endpoint}/{bucket}/{key}"
    req = urllib.request.Request(url, data=image_bytes, method="PUT")
    req.add_header("Content-Type", content_type)
    req.add_header("Host", endpoint)
    req.add_header("X-Amz-Content-Sha256", payload_hash)
    req.add_header("X-Amz-Date", amzdate)
    req.add_header("Authorization", authorization)
    req.add_header("Content-Length", str(len(image_bytes)))

    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        raise Exception(f"S3 error {e.code}: {e.read().decode()}")

    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"
    return cdn_url


def handler(event: dict, context) -> dict:
    """Загрузка фото в S3 для галереи свадебного сайта"""
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
    image_data = body.get("image", "")
    content_type = body.get("contentType", "image/jpeg")

    if not image_data:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "No image data"}),
        }

    if "," in image_data:
        image_data = image_data.split(",", 1)[1]

    image_bytes = base64.b64decode(image_data)
    ext = content_type.split("/")[-1].replace("jpeg", "jpg")
    key = f"wedding-gallery/{uuid.uuid4()}.{ext}"

    try:
        cdn_url = upload_to_s3(image_bytes, key, content_type)
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)}),
        }

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"url": cdn_url}),
    }