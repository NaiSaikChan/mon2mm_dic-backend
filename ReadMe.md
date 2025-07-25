# Mon Dictionary Backend API

This backend provides a RESTful API for managing a Mon language dictionary, including authentication, CRUD operations for words, and admin/statistics endpoints.

---

## 📚 Table of Contents

- [🔐 Authentication](#-authentication)
- [📖 Word Endpoints](#-word-endpoints)
- [� Category Endpoints](#-category-endpoints)
- [�🛠️ Admin Endpoints](#️-admin-endpoints)
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

---

## Get categories hierarchy (2-level)
```
GET /api/categories/hierarchy
```
**Description:** Returns categories organized in a 2-level hierarchy structure with parent categories and their subcategories.

**Response:**
```json
{
  "categories": [
    {
      "category_id": 1,
      "en_category_name": "Living Beings/Creatures",
      "mm_category_name": "သက်ရှိများ/သတ္တဝါများ",
      "mon_category_name": null,
      "parent_category_id": null,
      "level": 1,
      "subcategories": [
        {
          "category_id": 3,
          "en_category_name": "Human Beings",
          "mm_category_name": "လူသားများ",
          "mon_category_name": null,
          "parent_category_id": 1,
          "level": 2
        },
        {
          "category_id": 4,
          "en_category_name": "Animals",
          "mm_category_name": "တိရစ္ဆာန်များ",
          "mon_category_name": null,
          "parent_category_id": 1,
          "level": 2
        }
      ]
    }
  ],
  "meta": {
    "level1Count": 5,
    "level2Count": 15,
    "totalCategories": 20
  }
}
```

---

## Get Words by Category
```
GET /api/words/categories/{categoryId}
```
**Description:** Retrieves words belonging to a specific category with pagination support.

**Path Parameters:**
- `categoryId` (integer, required): The category ID to filter by

**Query Parameters:**
- `page` (integer, optional, default: 1): Page number for pagination
- `pageSize` (integer, optional, default: 12): Number of items per page
- `includeSubcategories` (boolean, optional, default: false): Include words from subcategories

**Example:**
```
GET /api/words/categories/5?page=1&pageSize=10&includeSubcategories=true
```

**Response:**
```json
{
  "data": [
    {
      "word_id": 123,
      "mon_word": "ကွေး",
      "pronunciation": "kweh",
      "pos_ids": [1],
      "pos_ENnames": ["noun"],
      "pos_Mmnames": ["နာမ်"],
      "definitions": ["ခွေး"],
      "examples": ["ကွေးဍောတ် = ခွေးကလေး"],
      "category_id": [5]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "category": {
    "category_id": 5,
    "en_category_name": "Animals",
    "mm_category_name": "တိရစ္ဆာန်များ",
    "mon_category_name": null,
    "parent_category_id": 1,
    "level": 2
  }
}
```

---

## Search Words within Category
```
GET /api/words/categories/{categoryId}/search
```
**Description:** Search for words within a specific category with advanced filtering options.

**Path Parameters:**
- `categoryId` (integer, required): The category ID to search within

**Query Parameters:**
- `query` (string, required): Search term
- `page` (integer, optional, default: 1): Page number for pagination
- `pageSize` (integer, optional, default: 12): Number of items per page
- `includeSubcategories` (boolean, optional, default: false): Include words from subcategories
- `searchFields` (string, optional, default: "word,definitions"): Comma-separated fields to search in

**Example:**
```
GET /api/words/categories/5/search?query=ကွေး&page=1&pageSize=10&includeSubcategories=true&searchFields=word,definitions
```

**Response:** Same structure as "Get Words by Category" with additional fields:
```json
{
  "data": [...],
  "pagination": {...},
  "category": {...},
  "searchQuery": "ကွေး",
  "searchFields": ["word", "definitions"]
}
```

---

## Get words by category
```
GET /api/words/categories/{categoryId}
```
**Description:** Returns paginated words filtered by a specific category.

**Path Parameters:**
- `categoryId` (integer, required): The category ID to filter by

**Query Parameters:**
- `page` (integer, optional, default: 1): Page number for pagination
- `pageSize` (integer, optional, default: 12): Number of items per page
- `includeSubcategories` (boolean, optional, default: false): Include words from subcategories

**Example:** `GET /api/words/categories/1?page=1&pageSize=10&includeSubcategories=true`

**Response:**
```json
{
  "data": [
    {
      "word_id": 123,
      "mon_word": "ကၠောန်",
      "pronunciation": "klaun",
      "pos_ids": [4],
      "pos_ENnames": ["verb"],
      "pos_Mmnames": ["ကြိယာ"],
      "definitions": ["လုပ်သည်။"],
      "examples": ["ကၠောန်ကမၠောန် = အလုပ်လုပ်သည်။"],
      "category_id": [1]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalItems": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "category": {
    "category_id": 1,
    "en_category_name": "Living Beings",
    "mm_category_name": "သက်ရှိများ",
    "mon_category_name": null,
    "level": 1,
    "parent_category_id": null
  }
}
```

---

## Search words within category
```
GET /api/words/categories/{categoryId}/search
```
**Description:** Search for words within a specific category with advanced filtering options.

**Path Parameters:**
- `categoryId` (integer, required): The category ID to search within

**Query Parameters:**
- `query` (string, required): Search term
- `page` (integer, optional, default: 1): Page number for pagination
- `pageSize` (integer, optional, default: 12): Number of items per page
- `includeSubcategories` (boolean, optional, default: false): Include words from subcategories
- `searchFields` (string, optional, default: "word,definitions"): Comma-separated fields to search in (word, definitions)

**Example:** `GET /api/words/categories/1/search?query=ကၠောန်&includeSubcategories=true&searchFields=word,definitions`

**Response:** Same format as "Get words by category" with additional fields:
```json
{
  "data": [...],
  "pagination": {...},
  "category": {...},
  "searchQuery": "ကၠောန်",
  "searchFields": ["word", "definitions"]
}
```

---

### User Favorites

#### Get All Favorites

```
GET /api/favorites
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "favorite_id": 1,
    "user_id": 2,
    "word_id": 123,
    "definition_id": 456,
    "notes": "optional notes",
    "metadata": { "any": "optional metadata" },
    "created_at": "2025-07-19T12:34:56.000Z",
    "updated_at": "2025-07-19T12:34:56.000Z",
    "word": "example",
    "pronunciation": "ɛɡˈzæmpəl",
    "language_id": 1,
    "definition": "A thing characteristic of its kind.",
    "pos_ENsymbol": "n",
    "pos_Mmsymbol": "န"
  }
]
```

---

#### Add Favorite

```
POST /api/favorites
```
**Request:**
```json
{
  "word_id": 123,
  "definition_id": 456,
  "notes": "optional notes",
  "metadata": { "any": "optional metadata" }
}
```
**Response:**
```json
{ "message": "Added to favorites." }
```

---

#### Update Favorite

```
PATCH /api/favorites/:wordId/:definitionId
```
**Params:**
- `wordId` (required): The word ID
- `definitionId` (required): The definition ID

**Request:**
```json
{
  "notes": "updated notes",
  "metadata": { "updated": "metadata" }
}
```
**Response:**
```json
{ "message": "Favorite updated." }
```

---

#### Delete Favorite

```
DELETE /api/favorites/:wordId/:definitionId
```
**Params:**
- `wordId` (required): The word ID
- `definitionId` (required): The definition ID

**Response:**
```json
{ "message": "Removed from favorites." }
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
