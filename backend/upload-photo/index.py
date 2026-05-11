import json
import os
import base64
import uuid
import hashlib
import hmac
import datetime
import urllib.request
import urllib.error


def _sign(key_bytes: bytes, msg: str) -> bytes:
    return hmac.HMAC(key_bytes, msg.encode("utf-8"), hashlib.sha256).digest()


def _make_authorization(access_key: str, secret_key: str, method: str,
                        bucket: str, key: str, host: str, region: str,
                        payload_hash: str, content_type: str,
                        amzdate: str, datestamp: str) -> str:
    canonical_uri = f"/{bucket}/{key}"
    canonical_headers = (
        f"content-type:{content_type}\n"
        f"host:{host}\n"
        f"x-amz-content-sha256:{payload_hash}\n"
        f"x-amz-date:{amzdate}\n"
    )
    signed_headers = "content-type;host;x-amz-content-sha256;x-amz-date"
    canonical_request = "\n".join([
        method, canonical_uri, "",
        canonical_headers, signed_headers, payload_hash,
    ])

    credential_scope = f"{datestamp}/{region}/s3/aws4_request"
    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256", amzdate, credential_scope,
        hashlib.sha256(canonical_request.encode("utf-8")).hexdigest(),
    ])

    k_date = _sign(("AWS4" + secret_key).encode("utf-8"), datestamp)
    k_region = _sign(k_date, region)
    k_service = _sign(k_region, "s3")
    k_signing = _sign(k_service, "aws4_request")
    signature = hmac.HMAC(k_signing, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    return (
        f"AWS4-HMAC-SHA256 Credential={access_key}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )


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

    access_key = os.environ["AWS_ACCESS_KEY_ID"]
    secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]
    host = "bucket.poehali.dev"
    bucket = "files"
    region = "us-east-1"

    t = datetime.datetime.utcnow()
    amzdate = t.strftime("%Y%m%dT%H%M%SZ")
    datestamp = t.strftime("%Y%m%d")
    payload_hash = hashlib.sha256(image_bytes).hexdigest()

    authorization = _make_authorization(
        access_key, secret_key, "PUT", bucket, key, host, region,
        payload_hash, content_type, amzdate, datestamp
    )

    url = f"https://{host}/{bucket}/{key}"
    req = urllib.request.Request(url, data=image_bytes, method="PUT")
    req.add_header("Content-Type", content_type)
    req.add_header("Host", host)
    req.add_header("X-Amz-Content-Sha256", payload_hash)
    req.add_header("X-Amz-Date", amzdate)
    req.add_header("Authorization", authorization)
    req.add_header("Content-Length", str(len(image_bytes)))

    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"S3 upload error {e.code}: {err_body}")
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": f"S3 error {e.code}: {err_body}"}),
        }

    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"
    print(f"Uploaded photo: {cdn_url}")

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"url": cdn_url}),
    }
