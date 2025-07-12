-- Create Language table
DROP TABLE IF EXISTS Language;

CREATE TABLE IF NOT EXISTS Language (
  language_id int NOT NULL AUTO_INCREMENT,
  language_code varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  language_name varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (language_id),
  UNIQUE KEY language_code (language_code)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Language
(language_id,
language_code,
language_name)
VALUES
(1,'EN','English')
,(2,'MNW','Mon')
,(3,'MM','Myanmar')
,(4,'TH','Thai');

-- Create PartOfSpeech Table
DROP TABLE IF EXISTS PartOfSpeech;

CREATE TABLE IF NOT EXISTS PartOfSpeech (
  pos_id int NOT NULL AUTO_INCREMENT,
  pos_ENname varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  pos_ENsymbol varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  pos_Monname varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  pos_Monsymbol varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  pos_Mmname varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  pos_Mmsymbol varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (pos_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO PartOfSpeech
VALUES ('1', 'noun', 'n', 'နာမ်', 'န', 'နာမ်', 'န')
,('2', 'pronoun', 'pron', 'နာမ်စၞး', 'နစ', 'နာမ်စား', 'နစ')
,('3', 'adjective', 'adj', 'နာမဝိသေသန', 'နာဝိ', 'နာမဝိသေသန', 'နာဝိ')
,('4', 'verb', 'v', 'ကြိယာ', 'ကြိ', 'ကြိယာ', 'ကြိ')
,('5', 'adverb', 'adv', 'ကြိယာဝိသေသန', 'ကြိဝိ', 'ကြိယာဝိသေသန', 'ကြိဝိ')
,('6', 'preposition', 'pre', 'ဝိဘတ်', 'ဝိ', 'ဝိဘတ်', 'ဝိ')
,('7', 'conjunction', 'con', 'သမ္ဗန္ဓ', 'သဗဓ', 'သမ္ဗန္ဓ', 'သဗဓ')
,('8', 'exclamation', 'excl', 'အာမေဍိတ်', 'အမဍ', 'အာမေဍိတ်', 'အမဍ')
,('9', 'unclassified', 'uncl', 'ပစ္စည်း', 'စည်း', 'ပစ္စည်း', 'စည်း')
,('10', 'pali', 'pali', 'ပါဠိ', 'ပါ', 'ပါဠိဝေါဟာရ', 'ပါ')
,('11', 'pali_sukta', 'pali_suk', 'ပါဠိလီု', 'ပါသက်', 'ပါဠိသက်ဝေါဟာရ', 'ပါသက်')
,('12', 'sanskrit', 'sans', 'သက္ကတ', 'သသက်', 'သက္ကတသက်ဝေါဟာရ', 'သသက်')
,('13', 'myanmar', 'myan', 'ဗၟာ', 'ဗၟာ', 'မြန်မာသက်ဝေါဟာရ', 'မြန်သက်')
,('14', 'english', 'eng', 'အင်္ဂလိက်', 'လိက်သက်', 'အင်္ဂလိပ်သက်ဝေါဟာရ', 'လိပ်သက်')
,('15', 'thai', 'tha', 'သေံ', 'သေံ', 'ယိုးဒယားသက်', 'ယိုး')
,('16', 'Hyndhu', 'Hynd', 'ဟိန္ဒူ', 'ဟိန္ဒူ', 'ဟိန္ဒူသက်ဝေါဟာရ', 'ဟိန္ဒူ')
,('17', 'Unknow', 'Unknow', 'Unknow', 'Unknow', 'Unknow', 'Unknow')
,('18', 'malay', 'malay', 'မလေဝ်', 'မလ', 'မလေး', 'မလ');

-- Create Word Table
DROP TABLE IF EXISTS Word;

CREATE TABLE IF NOT EXISTS Word (
  word_id int NOT NULL AUTO_INCREMENT,
  word varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  pronunciation varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  language_id int NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (word_id),
  KEY language_id (language_id),
  CONSTRAINT word_ibfk_1 FOREIGN KEY (language_id) REFERENCES Language (language_id) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Word
(word, pronunciation,language_id)
VALUES ('က—၁', NULL, '2')
,('က—၂', NULL, '2')
,('က—၃', NULL, '2')
,('ကကတီု', NULL, '2')
,('ကကဠာ', NULL, '2')
,('ကကလောတ်', NULL, '2')
,('ကကဝင်', NULL, '2')
,('ကကသော', NULL, '2')
,('ကကောန်ရှာတ်', NULL, '2')
,('ကက္ဍတ်', NULL, '2');

-- Create Definition Table
DROP TABLE IF EXISTS Definition;

CREATE TABLE IF NOT EXISTS Definition (
  definition_id int NOT NULL AUTO_INCREMENT,
  word_id int NOT NULL,
  language_id int NOT NULL,
  pos_id int NOT NULL,
  definition text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  example text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  category_id int DEFAULT NULL,
  PRIMARY KEY (definition_id),
  KEY word_id (word_id),
  KEY language_id (language_id),
  KEY pos_id (pos_id),
  CONSTRAINT definition_ibfk_1 FOREIGN KEY (word_id) REFERENCES Word (word_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT definition_ibfk_2 FOREIGN KEY (language_id) REFERENCES Language (language_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT definition_ibfk_3 FOREIGN KEY (pos_id) REFERENCES PartOfSpeech (pos_id) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Definition
(word_id,
language_id,
pos_id,
definition,
example,
category_id)
VALUES('1', '3', '1', 'ပထမမွန်ဗျည်း။', NULL, NULL)
, ('2', '3', '1', '၁။ မောင်း။ ခုတုံး။ လည်ချက်။ ပတ္တာချက်။ ခံတုံး။', NULL, NULL)
, ('2', '3', '1', '၂။ ကျားခံ။ ထောက်ခွ။ ထောက်တိုင်။', NULL, NULL)
, ('2', '3', '1', '၃။ ဆင်၊ မြင်းကကြိုးတန်ဆာ။', 'ကစိၚ် = ဆင်ကကြိုးတန်ဆာ။ ကချေံ = မြင်းကကြိုးတန်ဆာ။', NULL)
, ('2', '3', '4', 'ပိုလွန်သည်။', '‘ဟွံက’ ဟူ၍သုံးသည်။ ဟွံက = မက။', NULL)
, ('3', '3', '1', 'ငါး။', NULL, NULL)
, ('4', '3', '1', 'ငါးနုသန်း။', NULL, NULL)
, ('5', '3', '1', 'ငါးသေတ္တာ။', NULL, NULL)
, ('6', '3', '1', 'ငါးပုလွေ။', NULL, NULL)
, ('7', '3', '1', 'ငါးရံ့သင်းအုံ။', NULL, NULL)
, ('8', '3', '1', 'ငါးသယော။', NULL, NULL)
, ('9', '3', '1', 'ငါးကွမ်းရှပ်။', NULL, NULL)
, ('10', '3', '1', 'ငါးပြေမ။', NULL, NULL);

-- Create Synonym Table
DROP TABLE IF EXISTS Synonym;

CREATE TABLE IF NOT EXISTS Synonym (
  synonym_id int NOT NULL AUTO_INCREMENT,
  word_id int NOT NULL,
  language_id int NOT NULL,
  synonym varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (synonym_id),
  KEY word_id (word_id),
  KEY language_id (language_id),
  CONSTRAINT synonym_ibfk_1 FOREIGN KEY (word_id) REFERENCES Word (word_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT synonym_ibfk_2 FOREIGN KEY (language_id) REFERENCES Language (language_id) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Synonym
(word_id,
language_id,
synonym)
VALUES('10', '2', 'ကဍတ်')
, ('19', '2', 'ကဂဗံၚ်')
, ('3', '55', '2', 'ကမၚ်ကရ်')
, ('4', '76', '2', 'ကဆမ်')
, ('5', '76', '2', 'တဆံ')
, ('6', '86', '2', 'တဆေအ်')
, ('7', '87', '2', 'ကွာ်ကဆေအ်ထဍိုတ်')
, ('8', '88', '2', 'က္ည')
, ('9', '90', '2', 'က္ညၚ်')
, ('10', '90', '2', 'တမ္ညၚ်');

-- Create Categories Table
DROP TABLE IF EXISTS Category;

CREATE TABLE IF NOT EXISTS Category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    parent_category_id INT NULL, -- For hierarchical categories (e.g., Animals -> Land Animals)
    en_category_name VARCHAR(255) NOT NULL, -- English category name
    mm_category_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- Myanmar category name
    mon_category_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, -- Mon category name (Optional, can be NULL)
    description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, -- Optional description for the category
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES Category(category_id) ON DELETE SET NULL
);

-- Insert initial categories based on the previous list
-- Main Categories (Level 1)
INSERT INTO Category (en_category_name, mm_category_name, mon_category_name) VALUES
('Living Beings', 'သက်ရှိများ', NULL),
('Inanimate Objects/Things', 'သက်မဲ့များ/အရာဝတ္ထုများ', NULL),
('Nature & Phenomena', 'သဘာဝပတ်ဝန်းကျင်နှင့် ဖြစ်ရပ်များ', NULL),
('Knowledge & Concepts', 'ပညာရပ်နှင့် သဘောတရားများ', NULL),
('Miscellaneous', 'အခြား', NULL);

-- Sub-categories for 'Living Beings' (Level 2) - Assuming category_id for 'Living Beings' is 1
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Living Beings'), 'Human Beings', 'လူသား', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Living Beings'), 'Animals', 'တိရစ္ဆာန်များ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Living Beings'), 'Plants', 'အပင်များ', NULL);

-- Sub-categories for 'Human Beings' (Level 3) - Assuming category_id for 'Human Beings' is 6
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Human Beings'), 'Body Parts', 'လူ့ခန္ဓာကိုယ် အစိတ်အပိုင်းများ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Human Beings'), 'Diseases & Health', 'ရောဂါနှင့် ကျန်းမာရေး', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Human Beings'), 'Emotions', 'စိတ်ခံစားမှု', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Human Beings'), 'Relationships', 'ဆက်ဆံရေး', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Human Beings'), 'Professions/Occupations', 'အသက်မွေးဝမ်းကျောင်း/အလုပ်အကိုင်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Human Beings'), 'Human Qualities/Characteristics', 'လူ့အရည်အချင်း/စရိုက်လက္ခဏာ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Human Beings'), 'Behaviors/Actions', 'အပြုအမူ/လှုပ်ရှားမှု', NULL);

-- Sub-categories for 'Animals' (Level 3) - Assuming category_id for 'Animals' is 7
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Animals'), 'Land Animals', 'ကုန်းနေသတ္တဝါ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Animals'), 'Aquatic Animals', 'ရေနေသတ္တဝါ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Animals'), 'Air Animals/Birds', 'လေနေသတ္တဝါ/ငှက်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Animals'), 'Insects', 'အင်းဆက်ပိုးမွှား', NULL);

-- Sub-categories for 'Plants' (Level 3) - Assuming category_id for 'Plants' is 8
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Plants'), 'Trees', 'သစ်ပင်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Plants'), 'Flowers', 'ပန်း', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Plants'), 'Fruits', 'အသီး', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Plants'), 'Vegetables', 'ဟင်းသီးဟင်းရွက်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Plants'), 'Crops', 'သီးနှံပင်', NULL);

-- Sub-categories for 'Inanimate Objects/Things' (Level 2) - Assuming category_id for 'Inanimate Objects/Things' is 2
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Inanimate Objects/Things'), 'Tools/Appliances', 'အသုံးအဆောင်ပစ္စည်းများ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Inanimate Objects/Things'), 'Vehicles/Transportation', 'ယာဉ်/သယ်ယူပို့ဆောင်ရေး', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Inanimate Objects/Things'), 'Clothing', 'အဝတ်အထည်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Inanimate Objects/Things'), 'Food & Drink', 'အစားအသောက်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Inanimate Objects/Things'), 'Places/Locations', 'နေရာ/တည်နေရာ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Inanimate Objects/Things'), 'Possessions/Property', 'ပစ္စည်းဥစ္စာ/ပိုင်ဆိုင်မှု', NULL);

-- Sub-categories for 'Tools/Appliances' (Level 3) - Assuming category_id for 'Tools/Appliances' is 20
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Tools/Appliances'), 'Household Items', 'အိမ်သုံးပစ္စည်း', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Tools/Appliances'), 'Crafting Tools', 'လက်မှုပညာသုံးပစ္စည်း', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Tools/Appliances'), 'Agricultural Tools', 'စိုက်ပျိုးရေးသုံးပစ္စည်း', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Tools/Appliances'), 'Machinery', 'စက်ကိရိယာ', NULL);

-- Sub-categories for 'Vehicles/Transportation' (Level 3) - Assuming category_id for 'Vehicles/Transportation' is 21
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Vehicles/Transportation'), 'Land Transportation', 'ကုန်းကြောင်းသယ်ယူပို့ဆောင်ရေး', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Vehicles/Transportation'), 'Water Transportation', 'ရေကြောင်းသယ်ယူပို့ဆောင်ရေး', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Vehicles/Transportation'), 'Air Transportation', 'လေကြောင်းသယ်ယူပို့ဆောင်ရေး', NULL);

-- Sub-categories for 'Food & Drink' (Level 3) - Assuming category_id for 'Food & Drink' is 23
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Food & Drink'), 'Ingredients', 'ပါဝင်ပစ္စည်းများ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Food & Drink'), 'Cooking Methods', 'ချက်ပြုတ်နည်း', NULL);

-- Sub-categories for 'Places/Locations' (Level 3) - Assuming category_id for 'Places/Locations' is 24
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Places/Locations'), 'Cities/Villages', 'မြို့/ရွာ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Places/Locations'), 'Buildings', 'အဆောက်အအုံ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Places/Locations'), 'Countries', 'နိုင်ငံများ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Places/Locations'), 'Regions', 'နေရာဒေသများ', NULL);

-- Sub-categories for 'Nature & Phenomena' (Level 2) - Assuming category_id for 'Nature & Phenomena' is 3
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Nature & Phenomena'), 'Weather', 'ရာသီဥတု', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Nature & Phenomena'), 'Geology/Geography', 'ဘူမိဗေဒ/ပထဝီဝင်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Nature & Phenomena'), 'Astronomy/Space', 'နက္ခတ်ဗေဒ/အာကာသ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Nature & Phenomena'), 'Natural Disasters', 'သဘာဝဘေးအန္တရာယ်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Nature & Phenomena'), 'Time', 'အချိန်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Nature & Phenomena'), 'Colors', 'အရောင်များ', NULL);

-- Sub-categories for 'Geology/Geography' (Level 3) - Assuming category_id for 'Geology/Geography' is 34
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Geology/Geography'), 'Mountains/Rivers/Oceans', 'တောင်/မြစ်/ပင်လယ်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Geology/Geography'), 'Landforms', 'မြေမျက်နှာပြင်', NULL);

-- Sub-categories for 'Astronomy/Space' (Level 3) - Assuming category_id for 'Astronomy/Space' is 35
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Astronomy/Space'), 'Planets', 'ဂြိုဟ်များ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Astronomy/Space'), 'Stars', 'ကြယ်များ', NULL);

-- Sub-categories for 'Time' (Level 3) - Assuming category_id for 'Time' is 37
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Time'), 'Days/Months/Years', 'နေ့ရက်/လ/နှစ်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Time'), 'Seasons', 'ရာသီဥတုစက်ဝန်း', NULL);

-- Sub-categories for 'Knowledge & Concepts' (Level 2) - Assuming category_id for 'Knowledge & Concepts' is 4
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Knowledge & Concepts'), 'Education', 'ပညာရေး', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Knowledge & Concepts'), 'Science & Technology', 'သိပ္ပံနှင့် နည်းပညာ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Knowledge & Concepts'), 'Mathematics', 'သင်္ချာ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Knowledge & Concepts'), 'Economy/Business', 'စီးပွားရေး', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Knowledge & Concepts'), 'Law & Politics', 'ဥပဒေနှင့် နိုင်ငံရေး', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Knowledge & Concepts'), 'Culture & Arts', 'ယဉ်ကျေးမှုနှင့် အနုပညာ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Knowledge & Concepts'), 'Abstract Concepts', 'စိတ္တဇသဘောတရားများ', NULL);

-- Sub-categories for 'Education' (Level 3) - Assuming category_id for 'Education' is 43
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Education'), 'School Subjects', 'ကျောင်းဘာသာရပ်များ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Education'), 'Teaching/Learning', 'သင်ကြားရေး', NULL);

-- Sub-categories for 'Science & Technology' (Level 3) - Assuming category_id for 'Science & Technology' is 44
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Science & Technology'), 'Physics', 'ရူပဗေဒ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Science & Technology'), 'Chemistry', 'ဓာတုဗေဒ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Science & Technology'), 'Biology', 'ဇီဝဗေဒ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Science & Technology'), 'Computers & Technology', 'ကွန်ပျူတာနှင့် နည်းပညာ', NULL);

-- Sub-categories for 'Mathematics' (Level 3) - Assuming category_id for 'Mathematics' is 45
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Mathematics'), 'Numbers', 'ကိန်းဂဏန်း', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Mathematics'), 'Measurements', 'တိုင်းတာမှု', NULL);

-- Sub-categories for 'Culture & Arts' (Level 3) - Assuming category_id for 'Culture & Arts' is 48
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Culture & Arts'), 'Music', 'ဂီတ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Culture & Arts'), 'Literature', 'စာပေ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Culture & Arts'), 'Painting', 'ပန်းချီ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Culture & Arts'), 'Language', 'ဘာသာစကား', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Culture & Arts'), 'Religion', 'ဘာသာရေး', NULL);

-- Sub-categories for 'Miscellaneous' (Level 2) - Assuming category_id for 'Miscellaneous' is 5
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Miscellaneous'), 'Verbs', 'ကြိယာများ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Miscellaneous'), 'Adjectives', 'နာမဝိသေသနများ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Miscellaneous'), 'Pronouns', 'နာမ်စားများ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Miscellaneous'), 'Prepositions/Conjunctions', 'ဝိဘတ်/ဆက်စပ်ပုဒ်များ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Miscellaneous'), 'Interjections/Exclamations', 'အာမေဋိတ်/ညွှန်းဆိုမှုများ', NULL);

-- Sub-categories for 'Verbs' (Level 3) - Assuming category_id for 'Verbs' is 59
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Verbs'), 'Motion', 'ရွေ့လျားမှုဆိုင်ရာ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Verbs'), 'Cognition', 'အသိဉာဏ်ဆိုင်ရာ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Verbs'), 'Communication', 'စကားပြောဆိုမှုဆိုင်ရာ', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Verbs'), 'Occurrence', 'ဖြစ်ပျက်မှုဆိုင်ရာ', NULL);

-- Sub-categories for 'Adjectives' (Level 3) - Assuming category_id for 'Adjectives' is 60
INSERT INTO Category (parent_category_id, en_category_name, mm_category_name, mon_category_name) VALUES
((SELECT category_id FROM Category WHERE en_category_name = 'Adjectives'), 'Size', 'အရွယ်အစား', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Adjectives'), 'Shape', 'ပုံသဏ္ဌာန်', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Adjectives'), 'Quality', 'အရည်အသွေး', NULL),
((SELECT category_id FROM Category WHERE en_category_name = 'Adjectives'), 'Condition', 'အခြေအနေ', NULL);

-- Add an index for faster lookups on parent categories
CREATE INDEX idx_parent_category_id ON Category (parent_category_id);


-- //Create user favorite table
CREATE TABLE Favorite (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    word_id INT NOT NULL,
    notes TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, word_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES Word(word_id) ON DELETE CASCADE
);

-- //Create user table
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- e.g., 'admin', 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mondictionary.User
(username,
password_hash,
role)
VALUES
('admin','@Admin1234!','admin');

-- //Crate the monburmese_dic with JSON Array row.
DROP VIEW IF EXISTS monburmese_dic;
CREATE VIEW monburmese_dic AS
SELECT
    w.word_id,
    w.language_id as word_languageId,
    CASE 
        WHEN w.word LIKE '%—%' THEN substr(w.word, 1, instr(w.word, '—') - 1)
        WHEN w.word LIKE '%-%' THEN substr(w.word, 1, instr(w.word, '-') - 1)
        ELSE w.word 
    END AS mon_word,
    COALESCE(w.pronunciation, '') AS pronunciation,
    JSON_ARRAYAGG(p.pos_id) AS pos_ids,
    JSON_ARRAYAGG(p.pos_ENname) AS pos_ENnames,
    JSON_ARRAYAGG(p.pos_Mmname) AS pos_Mmnames,
    JSON_ARRAYAGG(s.synonym) AS synonyms_text,
    JSON_ARRAYAGG(d.definition_id) AS definition_ids,
    JSON_ARRAYAGG(d.language_id) AS def_languageId,
    JSON_ARRAYAGG(d.definition) AS definitions,
    JSON_ARRAYAGG(
        CASE
            WHEN d.example IS NULL THEN NULL
            ELSE d.example
        END
    ) AS examples,
    JSON_ARRAYAGG(d.category_id) AS category_id
FROM Word w
LEFT JOIN Definition d ON w.word_id = d.word_id
LEFT JOIN PartOfSpeech p ON d.pos_id = p.pos_id
LEFT JOIN Synonym s ON w.word_id = s.word_id
GROUP BY w.word_id, mon_word;

-- //Create the monbru_dic View
DROP VIEW IF EXISTS monbur_dic;
CREATE VIEW monbur_dic AS
SELECT
    w.word_id,

    -- Cleaned Mon word (remove em-dash or hyphen prefix)
    CASE 
        WHEN w.word LIKE '%—%' THEN SUBSTRING(w.word, 1, LOCATE('—', w.word) - 1)
        WHEN w.word LIKE '%-%' THEN SUBSTRING(w.word, 1, LOCATE('-', w.word) - 1)
        ELSE w.word 
    END AS mon_word,

    COALESCE(w.pronunciation, '') AS pronunciation,

    -- Aggregated POS info
    GROUP_CONCAT(DISTINCT p.pos_id ORDER BY p.pos_id SEPARATOR ', ') AS pos_ids,
    GROUP_CONCAT(DISTINCT p.pos_ENname ORDER BY p.pos_ENname SEPARATOR ', ') AS pos_ENnames,
    GROUP_CONCAT(DISTINCT p.pos_Mmname ORDER BY p.pos_Mmname SEPARATOR ', ') AS pos_Mmnames,

    -- Synonyms
    GROUP_CONCAT(DISTINCT s.synonym ORDER BY s.synonym SEPARATOR ', ') AS synonyms_text,

    -- Definitions
    GROUP_CONCAT(DISTINCT d.definition_id ORDER BY d.definition_id SEPARATOR '\n') AS definition_ids,
    GROUP_CONCAT(DISTINCT d.definition ORDER BY d.definition_id SEPARATOR '\n') AS definition,

    -- Cleaned examples
    GROUP_CONCAT(
        CASE
            WHEN d.example IS NULL THEN '-'
            WHEN d.example LIKE '% || %' THEN REPLACE(d.example, ' || ', '\n\n')
            WHEN d.example LIKE '%\\n%' THEN REPLACE(d.example, '\\n', '\n')
            WHEN d.example LIKE '%\\r%' THEN REPLACE(d.example, '\\r', '\n')
            ELSE d.example
        END
        ORDER BY d.definition_id SEPARATOR '\n'
    ) AS example

FROM Word w
LEFT JOIN Definition d ON w.word_id = d.word_id
LEFT JOIN PartOfSpeech p ON d.pos_id = p.pos_id
LEFT JOIN Synonym s ON w.word_id = s.word_id

GROUP BY w.word_id, mon_word
ORDER BY mon_word;

-- //Select and filter monbur_dic
SELECT * FROM monbur_dic WHERE
        mon_word = ?
        OR mon_word LIKE ?
        OR mon_word LIKE ?
        OR efinition LIKE ?
        ORDER BY CASE WHEN mon_word = ? THEN 1
          WHEN mon_word LIKE ? THEN 2
          WHEN mon_word LIKE ? THEN 3
        ELSE 4
        END
        LIMIT ? OFFSET ?;

-- //Select all categories ordered by their hierarchy
-- MySQL
-- Create the CategoryHierarchy View using a Recursive CTE
-- This view requires MySQL 8.0 or later.

DROP VIEW IF EXISTS CategoryHierarchy;

CREATE VIEW CategoryHierarchy AS
WITH RECURSIVE CategoryPath AS (
    -- Anchor member: Select top-level categories (those with no parent)
    SELECT
        c.category_id,
        c.en_category_name,
        c.mm_category_name,
        c.mon_category_name,
        c.parent_category_id,
        0 AS level, -- Level 0 for top-level categories
        CAST(c.en_category_name AS CHAR(1000)) AS en_path, -- Path in English
        CAST(c.mm_category_name AS CHAR(1000) CHARACTER SET utf8mb4) AS mm_path -- Path in Myanmar (Removed COLLATE here)
    FROM
        Category AS c
    WHERE
        c.parent_category_id IS NULL

    UNION ALL

    -- Recursive member: Join to find children categories
    SELECT
        c.category_id,
        c.en_category_name,
        c.mm_category_name,
        c.mon_category_name,
        c.parent_category_id,
        cp.level + 1 AS level, -- Increment level for children
        CONCAT(cp.en_path, ' -> ', c.en_category_name) AS en_path, -- Build English path
        CONCAT(cp.mm_path, ' -> ', c.mm_category_name) AS mm_path -- Build Myanmar path
    FROM
        Category AS c
    INNER JOIN
        CategoryPath AS cp ON c.parent_category_id = cp.category_id
)
SELECT
    category_id,
    en_category_name,
    mm_category_name,
    mon_category_name,
    parent_category_id,
    level,
    en_path,
    mm_path
FROM
    CategoryPath
ORDER BY
    en_path; -- Order by English path for a clear hierarchical display
