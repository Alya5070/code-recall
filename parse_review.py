import re
import json
import os

def parse_markdown(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    questions = []
    
    # Split by ## Q
    parts = re.split(r'##\s+(Q\d+[^\n]+)', content)
    
    # parts[0] is everything before the first question, which contains the first # EXAM
    current_exam = "Unknown Exam"
    
    def extract_exam(text):
        m = re.findall(r'#\s+(EXAM[^\n]+)', text)
        if m:
            return m[-1].strip()
        return None

    ex = extract_exam(parts[0])
    if ex:
        current_exam = ex
        
    for i in range(1, len(parts), 2):
        title = parts[i].strip()
        body = parts[i+1]
        
        # Check if there is an exam header in this body for the NEXT questions
        ex = extract_exam(body)
        
        # Split body into Question and Answer
        # Clean up ALL trailing backslashes before newlines across the entire body
        body = re.sub(r'\\\s*\n', '\n', body)
        qa_split = re.split(r'\*\*Answer:\*\*', body, maxsplit=1)
        if len(qa_split) < 2:
            continue
            
        q_text_raw = qa_split[0]
        a_text_raw = qa_split[1]
        
        # Thoroughly clean up question text
        q_text = re.sub(r'\*\*Question:\*\*', '', q_text_raw, flags=re.IGNORECASE)
        q_text = q_text.replace('\\', '').strip()
        
        # Remove exam headers from the end of a_text_raw if any
        a_text = re.sub(r'#\s+EXAM.*$', '', a_text_raw, flags=re.MULTILINE|re.DOTALL).strip()
        
        # Now parse the answer into intuition, code, execution
        intuition = ""
        code = ""
        execution = ""
        
        # Find code block
        code_match = re.search(r'```(?:python)?\n(.*?)```', a_text, re.DOTALL)
        if code_match:
            code = code_match.group(1).strip()
            # Intuition is before code
            intuition = a_text[:code_match.start()].strip()
            # Execution is after code
            execution = a_text[code_match.end():].strip()
        else:
            # No code block. Look for keywords like **Complexity:**, **Step-by-step failure:**, etc.
            exec_match = re.search(r'\*\*(?:Complexity|Step-by-step failure|Conclusion|Correctness|Alternative):\*\*', a_text)
            if exec_match:
                intuition = a_text[:exec_match.start()].strip()
                execution = a_text[exec_match.start():].strip()
            else:
                intuition = a_text.strip()
                
        questions.append({
            "exam": current_exam,
            "title": title,
            "question": q_text.strip('\\').strip(),
            "intuition": intuition.strip('\\').strip(),
            "code": code,
            "execution": execution.strip('\\').strip()
        })
        
        # Update current exam for next iteration
        if ex:
            current_exam = ex
            
    return questions

def main():
    filepath = r"D:\Python Project\Practice Algorithms\Algo Exam Questions with Answers.md"
    outpath = r"D:\Python Project\Practice Algorithms\code-recall\review-data.js"
    
    questions = parse_markdown(filepath)
    
    # Write to JS file
    js_content = f"const REVIEW_DATA = {json.dumps(questions, indent=4)};\n"
    
    with open(outpath, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully parsed {len(questions)} questions and saved to {outpath}")

if __name__ == "__main__":
    main()
