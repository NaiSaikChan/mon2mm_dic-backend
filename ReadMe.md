# Mon Dictionary Backend API

This backend provides a RESTful API for managing a Mon language dictionary, including authentication, CRUD operations for words, and admin/statistics endpoints.

---

## 📚 Table of Contents

- [🔐 Authentication](#-authentication)
- [📖 Word Endpoints](#-word-endpoints)
- [🛠️ Admin Endpoints](#️-admin-endpoints)
- [📊 Statistics](#-statistics)
- [❗ Error Handling](#-error-handling)
- [📝 Notes](#-notes)

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

````

**Request:**

```json
{
  "username": "yourname",
  "password": "yourpassword"
}
````

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

**Response:**

```json
[
  {
    "word_id": 4340,
    "mon_word": "ဆ",
    "pronunciation": "ချ",
    "pos_ids": [1, 7, 6, 2, 4],
    "pos_ENnames": ["noun", "conjunction", "preposition", "pronoun", "verb"],
    "pos_Mmnames": ["နာမ်", "သမ္ဗန္ဓ", "ဝိဘတ်", "နာမ်စား", "ကြိယာ"],
    "synonyms_text": [null],
    "definition_ids": [5147, 5148, 5149, 5150, 5151],
    "definitions": [
      "အဆ။",
      "သမျှ။",
      "လောက်မျှ။",
      "သလောက်။ မျှလောက်။",
      "မှန်းဆသည်။"
    ],
    "examples": [
      "ၜါဆ = နှစ်ဆ။",
      "“ဆကၠောန်လဝ်ဂှ် ရံၚ်ခိုဟ်ဒၟံၚ်ရ။” = “လုပ်ပြီးသမျှ ကြည့်၍ကောင်းသည်။”",
      "“ကၠဇၞော်ဆ ဂၠဴရ။” = “ကျားသည် နွားလောက်ကြီးသည်။”",
      "“ဆဂှ်ရဒး ကၠောန်။” = “ထိုမျှလောက်သာ လုပ်ရမည်။”",
      "“မူဒှ်ကၠုၚ်မာန်ရော ဆစမ်ရံၚ်ညိ။” = “ဘာဖြစ်လာနိုင်မလဲ မှန်းဆကြည့်ပါ။”"
    ],
    "category_id": [null]
  }
]
```

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
      "pronunciation": "",
      "pos_ids": "3, 4, 9",
      "pos_ENnames": "adjective, unclassified, verb",
      "pos_Mmnames": "ကြိယာ, နာမဝိသေသန, ပစ္စည်း",
      "synonyms_text": null,
      "definition_ids": "1260, 1261, 1262, 1263, 1264",
      "definition": "ပေးသည်။\n,နှင့်။\n...",
      "example": "“အဲကဵုကုဍေံ သြန်စှ်ဒကေဝ်ရ။” = “သူ့အား ငွေတစ်ဆယ်ကျပ် ကျွန်မပေးသည်။”\n..."
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
      "word_id": 14,
      "mon_word": "ကကၠဴ",
      "pronunciation": "",
      "pos_ids": "1",
      "pos_ENnames": "noun",
      "pos_Mmnames": "နာမ်",
      "synonyms_text": null,
      "definition_ids": "17",
      "definition": "ငါးပျံ။\n",
      "example": "-\n"
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
    "pos_ENsymbol": "n",
    "pos_Monname": "နာမ်",
    "pos_Monsymbol": "န",
    "pos_Mmname": "နာမ်",
    "pos_Mmsymbol": "န"
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
    "pos_id": 1,
    "pos_ENname": "noun",
    "pos_ENsymbol": "n",
    "pos_Monname": "နာမ်",
    "pos_Monsymbol": "န",
    "pos_Mmname": "နာမ်",
    "pos_Mmsymbol": "န"
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

* All admin endpoints require a valid JWT token with the `admin` role.
* Arrays such as synonyms, examples, etc., are returned as JSON arrays.
* On logout, clear your browser storage and tokens for security.
* For production, use HTTPS and secure your JWT secrets.
* For further details, see the code or contact the API maintainer.
