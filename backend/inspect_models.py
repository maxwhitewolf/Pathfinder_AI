"""
Script to inspect ML model files and understand their contents.
This helps you see what's stored in the .pkl files.
"""

import joblib
import pickle
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

def inspect_pkl_file(filepath, use_joblib=True):
    """Inspect a PKL file and show its contents"""
    print(f"\n{'='*60}")
    print(f"Inspecting: {filepath}")
    print(f"{'='*60}")
    
    if not os.path.exists(filepath):
        print(f"[ERROR] File not found: {filepath}")
        return
    
    try:
        if use_joblib:
            obj = joblib.load(filepath)
        else:
            with open(filepath, 'rb') as f:
                obj = pickle.load(f)
        
        print(f"[OK] Successfully loaded!")
        print(f"Type: {type(obj)}")
        print(f"Type name: {type(obj).__name__}")
        
        # Show size info
        if hasattr(obj, '__len__'):
            print(f"Length/Size: {len(obj)}")
        
        # Show shape if it's a numpy array or similar
        if hasattr(obj, 'shape'):
            print(f"Shape: {obj.shape}")
        
        # Show keys if it's a dict
        if isinstance(obj, dict):
            print(f"Keys: {list(obj.keys())}")
            for key, value in obj.items():
                print(f"  - {key}: {type(value).__name__}")
                if hasattr(value, 'shape'):
                    print(f"    Shape: {value.shape}")
        
        # Show attributes if it's a model object
        if hasattr(obj, '__dict__'):
            attrs = [attr for attr in dir(obj) if not attr.startswith('_')]
            print(f"Main attributes: {attrs[:10]}...")  # Show first 10
        
        # For pandas DataFrames
        if hasattr(obj, 'head'):
            print(f"\nFirst few rows:")
            print(obj.head())
        
        # For sklearn models, show parameters
        if hasattr(obj, 'get_params'):
            print(f"\nModel parameters:")
            params = obj.get_params()
            for key, value in list(params.items())[:5]:  # Show first 5
                print(f"  {key}: {value}")
        
        # For KNN models
        if hasattr(obj, 'n_neighbors'):
            print(f"\nKNN Model Info:")
            print(f"  n_neighbors: {obj.n_neighbors}")
            print(f"  algorithm: {obj.algorithm}")
        
        # For MultiLabelBinarizer
        if hasattr(obj, 'classes_'):
            print(f"\nMultiLabelBinarizer Info:")
            print(f"  Number of classes: {len(obj.classes_)}")
            print(f"  First 10 classes: {obj.classes_[:10]}")
        
    except Exception as e:
        print(f"[ERROR] Error loading file: {e}")
        import traceback
        traceback.print_exc()


def main():
    """Inspect all ML model files"""
    ml_models_dir = Path(__file__).parent / 'ml_models'
    
    print("="*60)
    print("ML Models Inspection Tool")
    print("="*60)
    print("\nNote: PKL files are binary pickle files.")
    print("They contain serialized Python objects (models, data, etc.)")
    print("You cannot open them as text files - they must be loaded with Python.")
    print("\n" + "="*60)
    
    # List of files to inspect
    files_to_inspect = [
        ('knn_career_model.pkl', True),  # KNN model - use joblib
        ('skills_mlb.pkl', True),  # MultiLabelBinarizer - use joblib
        ('career_reference.pkl', True),  # DataFrame - use joblib
        ('job_vectors.pkl', True),  # Numpy array - use joblib
        ('job_metadata.pkl', True),  # DataFrame - use joblib
        ('contextual_bandit.pkl', False),  # Dict - use pickle
    ]
    
    for filename, use_joblib in files_to_inspect:
        filepath = ml_models_dir / filename
        inspect_pkl_file(str(filepath), use_joblib)
    
    print("\n" + "="*60)
    print("Summary:")
    print("="*60)
    print("""
What these files contain:

1. knn_career_model.pkl - KNN (K-Nearest Neighbors) model
   -> Contains: Trained model with learned parameters/weights
   
2. skills_mlb.pkl - MultiLabelBinarizer
   -> Contains: Encoder that converts skills to binary vectors
   
3. career_reference.pkl - Pandas DataFrame
   -> Contains: Career data with skills mappings
   
4. job_vectors.pkl - Numpy array
   -> Contains: Pre-computed Doc2Vec embeddings for jobs
   
5. job_metadata.pkl - Pandas DataFrame
   -> Contains: Job information (titles, descriptions, etc.)
   
6. contextual_bandit.pkl - Dictionary
   -> Contains: Bandit algorithm data/parameters

Why you can't open PKL files:
   - They are BINARY files (not text)
   - They use Python's pickle protocol for serialization
   - You need Python's pickle or joblib to load them
   - Opening in a text editor shows garbled binary data

To inspect them, use this script or Python:
   import joblib
   model = joblib.load('ml_models/knn_career_model.pkl')
    """)


if __name__ == '__main__':
    main()

