#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
合并分割的 PDF 文件并提取内容
"""

import PyPDF2
import os

def merge_pdfs(pdf_files, output_file):
    """合并多个 PDF 文件"""
    pdf_writer = PyPDF2.PdfWriter()
    
    for pdf_file in pdf_files:
        if os.path.exists(pdf_file):
            print(f"正在处理: {pdf_file}")
            try:
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                print(f"  页数: {len(pdf_reader.pages)}")
                for page in pdf_reader.pages:
                    pdf_writer.add_page(page)
            except Exception as e:
                print(f"  错误: {e}")
        else:
            print(f"文件不存在: {pdf_file}")
    
    # 保存合并后的 PDF
    with open(output_file, 'wb') as output:
        pdf_writer.write(output)
    
    print(f"\n合并完成，保存到: {output_file}")
    return output_file

def extract_text_from_pdf(pdf_path, max_pages=50):
    """从 PDF 提取文本"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_path)
        num_pages = len(pdf_reader.pages)
        
        print(f"PDF 共有 {num_pages} 页")
        print(f"提取前 {min(max_pages, num_pages)} 页内容...\n")
        
        content = []
        for i in range(min(max_pages, num_pages)):
            page = pdf_reader.pages[i]
            text = page.extract_text()
            if text and text.strip():
                content.append(f"=== 第 {i+1} 页 ===\n{text}\n")
        
        return '\n'.join(content)
    
    except Exception as e:
        return f"读取 PDF 时出错: {e}"

def main():
    # 要合并的 PDF 文件
    pdf_files = [
        "五年级下册.pdf.1",
        "五年级下册.pdf.2",
        "五年级下册.pdf.3"
    ]
    
    # 合并后的文件
    merged_pdf = "五年级下册_完整版.pdf"
    
    # 检查文件是否存在
    existing_files = [f for f in pdf_files if os.path.exists(f)]
    print(f"找到 {len(existing_files)} 个 PDF 文件:")
    for f in existing_files:
        size = os.path.getsize(f) / (1024*1024)
        print(f"  - {f} ({size:.1f} MB)")
    
    if len(existing_files) == 0:
        print("没有找到 PDF 文件！")
        return
    
    # 合并 PDF
    print("\n开始合并 PDF 文件...")
    merge_pdfs(existing_files, merged_pdf)
    
    # 提取文本
    print("\n开始提取文本内容...")
    content = extract_text_from_pdf(merged_pdf, max_pages=100)
    
    # 保存到文件
    output_file = "教材内容_完整版.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n内容已保存到: {output_file}")
    print(f"文件大小: {os.path.getsize(output_file) / 1024:.1f} KB")
    
    # 显示前 3000 字符
    print("\n" + "=" * 60)
    print("内容预览:")
    print("=" * 60)
    print(content[:3000])
    print("=" * 60)

if __name__ == "__main__":
    main()