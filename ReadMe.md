Here's a well-structured `README.md` in Markdown format for your **Mon Dictionary Backend API**:

```markdown
# Mon Dictionary Backend API

This backend provides a RESTful API for managing a Mon language dictionary, including authentication, CRUD operations for words, and admin/statistics endpoints.

---

## 📚 Table of Contents

- Authentication
- Word Endpoints
- Admin Endpoints
- Statistics
- Error Handling
- Notes

---

## 🔐 Authentication

All protected endpoints require a JWT token in the `Authorization` header as:

```
Bearer <token>
```

### Register

```
POST /api/auth/register
```

Registers a new user.

---

### Login

```
POST /api/auth/login
```

**Request:**

```json
{
  "username": "yourname",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "token": "JWT_ACCESS_TOKEN",
  "refreshToken": "JWT_REFRESH_TOKEN",
  "user": {
    "id": "1",
    "username": "yourname",
    "email": "you@example.com",
    "role": "admin"
  }
}
```

> ⚠️ **Vulnerability Warning:** Avoid hardcoding credentials in source code.

---

### Refresh Token

```
POST /api/auth/refresh-token
```

**Request:**

```json
{ "refreshToken": "JWT_REFRESH_TOKEN" }
```

**Response:**

```json
{ "token": "NEW_JWT_ACCESS_TOKEN" }
```

---

### Logout

```
POST /api/auth/logout
```

**Request:**

```json
{ "userId": "1" }
```

**Response:**

```json
{ "message": "Logged out successfully." }
```

---

## 📖 Word Endpoints

### Search Words

```
GET /api/words/search?query=xxx
```

Returns an array of word objects matching the query.

---

### Get Word by ID

```
GET /api/words/:id
```

Returns details for a specific word.

---

### Paginated Search/Filter Words

```
GET /api/words/paginated-search?query=xxx&page=1&pageSize=1
```

**Response:**

```json
{
  "data": [
    {
      "word_id": 1051,
      "mon_word": "ကဵု",
      ...
    }
  ],
  "pagination": {
    "total": 138,
    "page": 1,
    "pageSize": 1,
    "totalPages": 138
  }
}
```

---

### Paginated Search by POS ID

```
GET /paginated-search?posId=1
```

**Response:**

```json
{
  "data": [
    {
      "word_id": 1718,
      "mon_word": "‘ကမၠဴ’",
      ...
    }
  ],
  "pagination": {
    "total": 5777,
    "page": 1,
    "pageSize": 20,
    "totalPages": 289
  }
}
```

---

### POS List

```
GET /api/pos/
```

**Response:**

```json
[
  {
    "pos_id": 1,
    "pos_ENname": "noun",
    ...
  }
]
```

---

### User Favorite

```
GET /api/favorites
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "favorite_id": 4,
    "user_id": 1,
    ...
  }
]
```

---

### Delete Favorite

```
DELETE /api/favorites/:id
```

---

### Update Favorite

```
PATCH /api/favorites/:id
```

**Request:**

```json
{
  "notes": "ကကြီးနှင့်အသံထွက်တူ",
  "metadata": "အဓိပ္ပါယ်အတူ မွန်ကသည် ငါးကိုဆိုလိုသည်။"
}
```

---

## 🛠️ Admin Endpoints

> All admin endpoints require a valid JWT token with the `admin` role.

### Paginated Search/Filter Words

```
GET /api/admin/words?page=1&pageSize=20&query=xxx&posId=4
```

---

### Add Word

```
POST /api/admin/words
```

**Request:**

```json
{
  "mon_word": "word",
  "pronunciation": "",
  "word_language_id": 1,
  "definition_text": "definition",
  "example_text": "example",
  "definition_language_id": 1,
  "pos_id": 4,
  "synonyms": [{ "text": "synonym1" }],
  "category_id": null
}
```

---

### Update Word

```
PUT /api/admin/words/:id
```

Same request format as Add Word, with `definition_id`.

---

### Delete Word

```
DELETE /api/admin/words/:id
```

---

## 📊 Statistics

```
GET /api/admin/stats
```

**Response:**

```json
{
  "totalWords": 123,
  "totalDefinitions": 456,
  "totalUsers": 7
}
```

---

## ❗ Error Handling

All endpoints return appropriate HTTP status codes and error messages.

**Example:**

```json
{
  "message": "Internal Server Error",
  "error": "Error details..."
}
```

---

## 📝 Notes

- All admin endpoints require a valid JWT token with the `admin` role.
- Arrays such as synonyms, examples, etc., are returned as JSON arrays.
- On logout, clear your browser storage and tokens for security.
- For production, use HTTPS and secure your JWT secrets.
- For further details, see the code or contact the API maintainer.
```

Would you like me to generate this as a downloadable `README.md` file for you?