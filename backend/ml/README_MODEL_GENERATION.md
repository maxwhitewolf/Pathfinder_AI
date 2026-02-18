# ML Model Generation Guide

## Overview

The notebooks in the `backend/ml/` folder contain code to generate all the PKL model files used by the application. Yes, if you run these notebooks, you will regenerate all the PKL files in `ml_models/`.

## Files Generated

### From `ai-career-recommendation-system.ipynb`:
1. **`knn_career_model.pkl`** - KNN model for career recommendations
2. **`skills_mlb.pkl`** - MultiLabelBinarizer for encoding skills
3. **`career_reference.pkl`** - DataFrame with career-to-skills mappings

### From `jobs-skills-mapping-for-career-analysis (3).ipynb`:
4. **`doc2vec_job_model.model`** - Doc2Vec model for job matching
5. **`job_vectors.pkl`** - Pre-computed job embeddings (numpy array)
6. **`job_metadata.pkl`** - DataFrame with job information
7. **`contextual_bandit.pkl`** - Contextual bandit model for roadmap selection

## Required Datasets

### For KNN Career Model:
- **File**: `AI-based Career Recommendation System.csv`
- **Location**: `/kaggle/input/ai-based-career-recommendation-system/`
- **Columns needed**: `Skills`, `Interests`, `Recommended_Career`
- **Size**: ~200 records (based on notebook output)

### For Doc2Vec Job Model:
- **File**: `formatted_jobs.csv`
- **Location**: `/kaggle/input/jobs-and-skills-mapping-for-career-analysis/`
- **Columns needed**: `job_title`, `Short_description`, `Skills_required`, `Industry`, `Pay_grade`, `ID_num`
- **Size**: ~970 jobs (based on model output)

## Estimated Time to Run

### 1. KNN Career Model (`ai-career-recommendation-system.ipynb`)
- **Time**: **2-5 minutes**
- **Steps**:
  - Load dataset (~1 sec)
  - Parse skills and create encodings (~10-30 sec)
  - Train KNN model (~5-10 sec)
  - Save files (~1 sec)
- **Total**: Fast, mostly data preprocessing

### 2. Doc2Vec Job Model (`jobs-skills-mapping-for-career-analysis (3).ipynb`)
- **Time**: **10-30 minutes** (depends on CPU)
- **Steps**:
  - Load dataset (~1 sec)
  - Tokenize documents (~30-60 sec)
  - Build vocabulary (~10-30 sec)
  - **Train Doc2Vec model** (~10-25 minutes) - THIS IS THE SLOWEST PART
    - 40 epochs on ~970 documents
    - Vector size: 100 dimensions
    - Workers: 4 (parallel processing)
  - Pre-compute job vectors (~10-30 sec)
  - Save files (~5-10 sec)
- **Total**: Moderate, training Doc2Vec is computationally intensive

### 3. Contextual Bandit (`jobs-skills-mapping-for-career-analysis (3).ipynb`)
- **Time**: **1-3 minutes**
- **Steps**:
  - Initialize bandit (~1 sec)
  - Generate synthetic training data (~5-10 sec)
  - Train on 200 synthetic samples (~10-30 sec)
  - Test and simulate learning (~30-60 sec)
  - Save file (~1 sec)
- **Total**: Fast, mostly synthetic data generation

## Total Time Estimate

**If running everything from scratch:**
- **Minimum**: ~15-20 minutes (on a fast CPU)
- **Average**: ~25-35 minutes (on a typical laptop)
- **Maximum**: ~40-50 minutes (on a slower machine)

**Breakdown:**
- KNN model: 2-5 min
- Doc2Vec model: 10-30 min (main bottleneck)
- Contextual bandit: 1-3 min

## How to Run

### Option 1: Run in Jupyter Notebook
1. Open the notebook files in Jupyter
2. Make sure you have the datasets in the correct paths
3. Update the dataset paths if needed (currently set for Kaggle)
4. Run all cells sequentially

### Option 2: Convert to Python Scripts
You can convert the notebooks to `.py` files and run them:
```bash
jupyter nbconvert --to script ai-career-recommendation-system.ipynb
jupyter nbconvert --to script "jobs-skills-mapping-for-career-analysis (3).ipynb"
python ai-career-recommendation-system.py
python "jobs-skills-mapping-for-career-analysis (3).py"
```

### Option 3: Run Specific Cells
If you only need to regenerate specific models, you can run only the relevant cells.

## Important Notes

1. **Dataset Paths**: The notebooks currently use Kaggle paths (`/kaggle/input/...`). You'll need to update these to your local paths.

2. **Dependencies**: Make sure you have:
   - pandas
   - numpy
   - scikit-learn
   - gensim
   - joblib
   - pickle (built-in)

3. **Output Location**: The notebooks save files in the current working directory. Make sure to:
   - Run from the correct directory, OR
   - Update save paths to `../ml_models/` to match your project structure

4. **Model Versions**: The inspection script showed version warnings:
   - Models were trained with scikit-learn 1.2.2
   - You're using 1.6.0
   - This might cause compatibility issues - consider retraining if you encounter problems

5. **Doc2Vec Training**: The Doc2Vec model is the most time-consuming. You can reduce training time by:
   - Reducing `epochs` (currently 40)
   - Reducing `vector_size` (currently 100)
   - But this may reduce model quality

## Quick Start (If You Have Datasets)

```python
# 1. Update dataset paths in notebooks
# 2. Run KNN notebook first (faster)
# 3. Run Doc2Vec notebook (takes longer)
# 4. Move generated files to ml_models/ directory
```

## File Sizes (Expected)

- `knn_career_model.pkl`: ~21 KB
- `skills_mlb.pkl`: ~1.6 KB
- `career_reference.pkl`: ~6.6 KB
- `doc2vec_job_model.model`: ~1.4 MB (largest)
- `job_vectors.pkl`: ~379 KB
- `job_metadata.pkl`: ~170 KB
- `contextual_bandit.pkl`: ~1.7 KB

**Total**: ~2 MB

