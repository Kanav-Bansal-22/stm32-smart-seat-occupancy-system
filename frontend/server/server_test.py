import requests

url = "http://localhost:3001/api/chairs"
data = {
    "chairId": "chair-1",
    "is_occupied": True
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=data, headers=headers)

# Print response from the server
print("Status Code:", response.status_code)
print("Response Body:", response.text)
