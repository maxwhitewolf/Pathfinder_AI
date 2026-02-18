"""
Check prerequisites for running ML model generation notebooks
"""

import os
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists"""
    exists = os.path.exists(filepath)
    status = "[OK]" if exists else "[MISSING]"
    print(f"{status} {description}: {filepath}")
    return exists

def check_package(package_name, import_name=None):
    """Check if a Python package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        print(f"[OK] {package_name} is installed")
        return True
    except ImportError:
        print(f"[MISSING] {package_name} is NOT installed (pip install {package_name})")
        return False

def main():
    print("="*70)
    print("ML MODEL GENERATION - PREREQUISITES CHECK")
    print("="*70)
    
    print("\n1. Checking Python packages...")
    print("-" * 70)
    packages = [
        ("pandas", "pandas"),
        ("numpy", "numpy"),
        ("scikit-learn", "sklearn"),
        ("gensim", "gensim"),
        ("joblib", "joblib"),
    ]
    
    all_packages_ok = True
    for pkg_name, import_name in packages:
        if not check_package(pkg_name, import_name):
            all_packages_ok = False
    
    print("\n2. Checking for required datasets...")
    print("-" * 70)
    print("\nNote: Update these paths in the notebooks to match your setup")
    print("\nFor KNN Career Model:")
    print("  Expected: AI-based Career Recommendation System.csv")
    print("  Current path in notebook: /kaggle/input/ai-based-career-recommendation-system/")
    
    print("\nFor Doc2Vec Job Model:")
    print("  Expected: formatted_jobs.csv")
    print("  Current path in notebook: /kaggle/input/jobs-and-skills-mapping-for-career-analysis/")
    
    print("\n3. Checking output directory...")
    print("-" * 70)
    ml_models_dir = Path(__file__).parent.parent / 'ml_models'
    if ml_models_dir.exists():
        print(f"[OK] Output directory exists: {ml_models_dir}")
        
        # Check existing files
        existing_files = list(ml_models_dir.glob('*.pkl')) + list(ml_models_dir.glob('*.model'))
        if existing_files:
            print(f"\n  Existing model files ({len(existing_files)}):")
            for f in existing_files:
                size_kb = f.stat().st_size / 1024
                print(f"    - {f.name} ({size_kb:.1f} KB)")
            print("\n  [WARNING] Running notebooks will OVERWRITE these files!")
        else:
            print("  No existing model files found")
    else:
        print(f"[MISSING] Output directory does not exist: {ml_models_dir}")
        print(f"  Create it with: mkdir {ml_models_dir}")
    
    print("\n4. Estimated time to generate all models...")
    print("-" * 70)
    print("  KNN Career Model:        2-5 minutes")
    print("  Doc2Vec Job Model:       10-30 minutes (main bottleneck)")
    print("  Contextual Bandit:       1-3 minutes")
    print("  " + "-" * 50)
    print("  TOTAL:                  15-40 minutes")
    
    print("\n" + "="*70)
    if all_packages_ok:
        print("✓ All required packages are installed!")
        print("\nNext steps:")
        print("  1. Make sure you have the required CSV datasets")
        print("  2. Update dataset paths in the notebooks")
        print("  3. Run the notebooks to generate model files")
        print("  4. Move generated files to ml_models/ directory")
    else:
        print("✗ Some packages are missing!")
        print("\nInstall missing packages with:")
        print("  pip install pandas numpy scikit-learn gensim joblib")
    
    print("="*70)

if __name__ == '__main__':
    main()

