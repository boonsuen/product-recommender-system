from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import re

datasetFolderPath = r'/Users/boonsuenoh/Documents/Dev/product-recommender-system/dataset/'
products = pd.read_json(datasetFolderPath + 'subset_meta_Electronics_cleansed.json')
products = products.drop(columns=['fit', 'rank', 'details', 'tech1', 'tech2', 'price', 'date', 'imageURL', 'similar_item'], errors='ignore')
products = products.head(30000)

# Defining text cleaning function
def text_cleaning(text):
    text = re.sub(r'amp;','',text)
    text = re.sub(r'&quot;', '"', text)
    text = re.sub(r'&reg;', '®', text)
    text = re.sub(r'</span>', '', text)
    return text

products.loc[products['main_cat'].str.contains('AMAZON FASHION'), 'main_cat'] = 'Amazon Fashion'
products["category"] = products["category"].str.join(' ')

# Applying text cleaning function to each row
products['main_cat'] = products['main_cat'].apply(lambda text: text_cleaning(text))
products['brand'] = products['brand'].apply(lambda text: text_cleaning(text))
products['title'] = products['title'].apply(lambda text: text_cleaning(text))
products['category'] = products['category'].apply(lambda text: text_cleaning(text))

products['imageURLHighRes'] = products['imageURLHighRes'].apply(lambda l: l[0] if len(l) > 0 else '')

# Creating datasoup made of selected columns
products['ensemble'] = products['title'] + ' ' + products['category'] + ' ' + products['brand'] + ' ' + products['main_cat']

tf_coll = TfidfVectorizer(analyzer='word',ngram_range=(1, 2),min_df=0, stop_words='english')
tfidf_matrix_coll = tf_coll.fit_transform(products['ensemble'])
cosine_sim_coll = linear_kernel(tfidf_matrix_coll, tfidf_matrix_coll)

# Build a 1-dimensional array with product titles
titles_3 = products[['title', 'category', 'brand', 'main_cat', 'imageURLHighRes']]
indices_3 = pd.Series(products.index, index=products['title'])

all_titles = [products['title'][i] for i in range(len(products['title']))]

# Function that get product recommendations based on the cosine similarity score of ensemble
def ensemble_recommendations(title):
    # Get the index of the product that matches the title
    idx = indices_3[title]
    
    # Use the first product if there're multiple products with same title
    if (not isinstance(idx, (int, np.int64))):
        idx = indices_3[title].iloc[0]
    
    # Get the pairwsie similarity scores of all products with that product
    sim_scores = list(enumerate(cosine_sim_coll[idx]))
    # Sort the products based on the similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    # Get the scores of the 20 most similar products
    sim_scores = sim_scores[0:20]
    # Get the product indices
    product_indices = [i[0] for i in sim_scores]
    # Return the top 20 most similar products
    return titles_3.iloc[product_indices]

# Flask app
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/content-based', methods=['POST'])
@cross_origin()
def contentBased():
    content = request.get_json()
    product_title = content['title']
    if product_title not in all_titles:
        
        return jsonify(
            success = False,
            message = "Product not found"
        )
    else:
        result_final = ensemble_recommendations(product_title)
        return result_final.to_json(orient='records')
    
@app.route('/titles', methods=['GET'])
@cross_origin()
def getTitle():
    return jsonify(
        data = all_titles
    )

if __name__ == '__main__':
    app.run()