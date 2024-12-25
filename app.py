from flask import Flask, render_template, request, jsonify
import os
import traceback
import sys
from io import StringIO

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/export_code', methods=['POST'])
def export_code():
    code = request.form['code']
    
    if code:
        file_path = "exported_code.py"
        try:
            with open(file_path, "w") as f:
                f.write(code)
            return jsonify({"status": "success", "message": f"Code exported to {file_path}"})
        except Exception as e:
            return jsonify({"status": "error", "message": f"Error occurred: {str(e)}"})
    return jsonify({"status": "error", "message": "No code to export"})

@app.route('/preview_code', methods=['POST'])
def preview_code():
    code = request.form['code']
    inputs = request.form.get('inputs', '')  # Retrieve input values if provided
    local_vars = {}

    # Convert inputs from string to dictionary (e.g., {'name': 'John'})
    try:
        if inputs:
            local_vars.update(eval(inputs))  # Convert string input into dictionary
    except:
        return jsonify({"status": "error", "message": "Invalid input format"})

    try:
        # Redirect stdout to capture print statements
        old_stdout = sys.stdout
        new_stdout = StringIO()
        sys.stdout = new_stdout

        # Execute the code safely in a local context
        exec(code, {}, local_vars)
        
        # Get the output from the redirected stdout
        output = new_stdout.getvalue()
        if not output:  # In case there's no output from print statements
            output = local_vars.get("output", "Code executed successfully without output.")
        
        # Reset stdout
        sys.stdout = old_stdout
        
        return jsonify({"status": "success", "preview": output})
    except Exception as e:
        error_message = traceback.format_exc()
        return jsonify({"status": "error", "message": f"Error in previewing code: {str(e)}"})

@app.route('/run_code', methods=['POST'])
def run_code():
    code = request.form['code']
    inputs = request.form.get('inputs', '')  # Retrieve input values if provided
    local_vars = {}

    # Convert inputs from string to dictionary (e.g., {'name': 'John'})
    try:
        if inputs:
            local_vars.update(eval(inputs))  # Convert string input into dictionary
    except:
        return jsonify({"status": "error", "message": "Invalid input format"})

    try:
        # Redirect stdout to capture print statements
        old_stdout = sys.stdout
        new_stdout = StringIO()
        sys.stdout = new_stdout

        # Execute the code safely
        exec(code, {}, local_vars)
        
        # Get the output from the redirected stdout
        output = new_stdout.getvalue()
        if not output:  # In case there's no output from print statements
            output = local_vars.get("output", "Code executed successfully without output.")
        
        # Reset stdout
        sys.stdout = old_stdout
        
        return jsonify({"status": "success", "output": output})
    except Exception as e:
        error_message = traceback.format_exc()
        return jsonify({"status": "error", "message": error_message})

@app.route('/new_file', methods=['POST'])
def new_file():
    return jsonify({"status": "success", "message": "New file created", "code": ""})

@app.route('/update_theme', methods=['POST'])
def update_theme():
    theme = request.form['theme']
    return jsonify({"status": "success", "theme": theme})

@app.route('/update_font_size', methods=['POST'])
def update_font_size():
    font_size = request.form['font_size']
    return jsonify({"status": "success", "font_size": font_size})

@app.route('/code_review', methods=['POST'])
def code_review():
    code = request.form['code']
    comments = request.form['comments']
    approval_status = request.form['approval_status']  # "approved" or "rejected"

    try:
        return jsonify({"status": "success", "message": "Code review submitted successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": f"Error in code review: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)
