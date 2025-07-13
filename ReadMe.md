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

Returns an array of word objects matching the query as the Get word by ID.

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
    "word_languageId": 2,
    "mon_word": "ဆ",
    "pronunciation": "ချ",
    "pos_ids": [1, 7, 6, 2, 4],
    "pos_ENnames": ["noun", "conjunction", "preposition", "pronoun", "verb"],
    "pos_Mmnames": ["နာမ်", "သမ္ဗန္ဓ", "ဝိဘတ်", "နာမ်စား", "ကြိယာ"],
    "synonyms_text": [null],
    "definition_ids": [5147, 5148, 5149, 5150, 5151],
    "def_languageId": [3],
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
            "word_languageId": 2,
            "mon_word": "ကဵု",
            "pronunciation": "",
            "pos_ids": [
                4,
                3,
                9
            ],
            "pos_ENnames": [
                "verb",
                "adjective",
                "unclassified"
            ],
            "pos_Mmnames": [
                "ကြိယာ",
                "နာမဝိသေသန",
                "ပစ္စည်း"
            ],
            "synonyms_text": [
                null
            ],
            "definition_ids": [
                7771,
                7772,
                7773,
                7774,
                7775
            ],
            "def_languageId": [
                3,
                3,
                3,
                3,
                3
            ],
            "definitions": [
                "ပေးသည်။",
                "နှင့်။",
                "၁။ (ကြိရှေ့ဆက်) ဖြစ်စေခြင်းကိုပြသည်။ ကာရိုက်ကြိယာဖြစ်စေသည်။",
                "၂။ (ကြိနောက်ဆက်) သူတစ်ပါးအတွက် ဆောင်ရွက်သည့်သဘောကို ပြသောစကားလုံး။",
                "၃။ (ကြိဝိဖြစ်စေသော ကြိရှေ့ဆက်)"
            ],
            "examples": [
                "“အဲကဵုကုဍေံ သြန်စှ်ဒကေဝ်ရ။” = “သူ့အား ငွေတစ်ဆယ်ကျပ် ကျွန်မပေးသည်။”",
                "ပုၚ်ကဵုသွ = ထမင်းနှင့်ဟင်း။ မိကဵုမ = အမိနှင့်အဖ။",
                "ကဵုစဴ = ပြန်စေသည်။ ကဵုလလံသွာ = ပျောက်ပြယ်စေသည်။ ကဵုကၠောန် = လုပ်စေသည်။",
                "ဟီုကဵု = ပြောပေးသည်။ || ကၠောန်ကဵု = လုပ်ပေးသည်။",
                "“ပတၠသမ္တီ သ္ၚဳကဵုဂၠိၚ် ညာတ်ကဵုသ္ၚောဲညိ။” = “အသိဉာဏ်ရှိသူဖြစ်လျက် အရှည်ကိုကြည့်၍ အဝေးကိုမြင်နိုင်ပါစေ။” (ကဵု × ဂၠိၚ်) “အာကဵုပြဟ်ရ။” = “မြန်မြန်သွားပါ။” (ကဵု × ပြဟ်)"
            ],
            "category_id": [
                null
            ]
        }
    ],
    "pagination": {
        "currentPage": 1,
        "pageSize": 1,
        "totalItems": 139,
        "totalPages": 139,
        "hasNextPage": true,
        "hasPreviousPage": false
    }
}
```

---

### Paginated Search by POS ID

```
GET /paginated-search?posId=1
```

Response: Same as the Paginated Search/Filter Words.

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

## Get word of the day
```
GET /api/words/word-of-the-day
```
Response: Same as the Paginated Search/Filter Words.

---

## Get random words for featured section
```
GET /api/words/random?count=3
```
Response: Same as the Paginated Search/Filter Words.

---

## Get categories
```
GET /api/categories
```
**Response** 
Returns all categories from categoryhierarchy view.
```json
[
    {
        "category_id": 2,
        "en_category_name": "Inanimate Objects/Things",
        "mm_category_name": "သက်မဲ့များ/အရာဝတ္ထုများ",
        "mon_category_name": null,
        "parent_category_id": null,
        "level": 0,
        "en_path": "Inanimate Objects/Things",
        "mm_path": "သက်မဲ့များ/အရာဝတ္ထုများ"
    },...
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
id= word_id
---

### Update Favorite

```
PATCH /api/favorites/:id
```
id= word_id
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
Here are the endpoint details and request body formats for both AddWord and UpdateWord:

---

### 1. AddWord Endpoint

- **Endpoint:**  
  `POST /api/words`

- **Request Body Example:**
```json
{
  "mon_word": "example",
  "pronunciation": "ɛɡˈzæmpəl",
  "word_language_id": 1,
  "definitions": [
    {
      "definition_text": "A thing characteristic of its kind.",
      "example_text": "This is an example sentence.",
      "definition_language_id": 1,
      "pos_id": 2,
      "category_id": 3
    }
  ],
  "synonyms": ["sample", "instance"],
  "category_id": 3
}
```
- **Notes:**
  - `mon_word` (string) and at least one `definitions` entry (array) are required.
  - Each definition object does not need a `definition_id` (it will be created).
  - `synonyms` is an array of strings (optional).
  - `category_id` is optional if not used in your logic.

---

### 2. UpdateWord Endpoint

- **Endpoint:**  
  `PUT /api/words/:id`

- **Request Body Example:**
```json
{
  "mon_word": "example",
  "pronunciation": "ɛɡˈzæmpəl",
  "word_language_id": 1,
  "definitions": [
    {
      "definition_id": 10,
      "definition_text": "A thing characteristic of its kind.",
      "example_text": "This is an updated example.",
      "definition_language_id": 1,
      "pos_id": 2,
      "category_id": 3
    },
    {
      "definition_text": "A new definition.",
      "example_text": "Another example.",
      "definition_language_id": 1,
      "pos_id": 2,
      "category_id": 3
    }
  ],
  "synonyms": ["sample", "instance", "illustration"],
  "category_id": 3
}
```
- **Notes:**
  - `mon_word` (string) and at least one `definitions` entry (array) are required.
  - For existing definitions, include `definition_id` to update.
  - For new definitions, omit `definition_id` (they will be inserted).
  - `synonyms` array will replace all synonyms for the word.
  - `category_id` is optional if not used in your logic.

---

### Delete Word

```
DELETE /api/admin/words/:id
```
id= word_id
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
