'use client';

import React from 'react';
import { Download, FileText } from 'lucide-react';

export default function MarkdownPreviewer({ markdown, filename = 'report.md' }) {
    if (!markdown) return null;

    // A lightweight markdown to html parser
    const parseMarkdown = (mdText) => {
        const lines = mdText.split('\n');
        let htmlElements = [];
        let inList = false;
        let listItems = [];
        let inTable = false;
        let tableRows = [];

        const flushList = (key) => {
            if (listItems.length > 0) {
                htmlElements.push(
                    <ul key={`list-${key}`} style={{ paddingLeft: '24px', margin: '0 0 16px 0', fontSize: '15px', color: 'var(--color-text-secondary)' }}>
                        {listItems.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '6px' }} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ul>
                );
                listItems = [];
                inList = false;
            }
        };

        const flushTable = (key) => {
            if (tableRows.length > 0) {
                // Table header row is index 0. Table formatting divider is index 1. Content rows are index 2+.
                const headerCells = tableRows[0];
                const dataRows = tableRows.slice(2);

                htmlElements.push(
                    <div key={`table-container-${key}`} style={{ overflowX: 'auto', marginBottom: '24px', borderRadius: '12px', border: '1px solid var(--color-border-light)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left', backgroundColor: 'var(--color-background)' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--color-surface-light)', borderBottom: '2px solid var(--color-border-light)' }}>
                                    {headerCells.map((cell, idx) => (
                                        <th key={idx} style={{ padding: '12px 16px', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: cell }} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dataRows.map((row, rowIdx) => (
                                    <tr key={rowIdx} style={{ borderBottom: rowIdx === dataRows.length - 1 ? 'none' : '1px solid var(--color-border-light)' }}>
                                        {row.map((cell, cellIdx) => (
                                            <td key={cellIdx} style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }} dangerouslySetInnerHTML={{ __html: cell }} />
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                tableRows = [];
                inTable = false;
            }
        };

        const parseInlineText = (text) => {
            // Replace **bold** with <strong>bold</strong>
            let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Replace *italic* with <em>italic</em>
            formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
            // Replace `code` with <code>code</code>
            formatted = formatted.replace(/`(.*?)`/g, '<code style="background-color: var(--color-surface-light); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">$1</code>');
            return formatted;
        };

        lines.forEach((line, idx) => {
            const trimmed = line.trim();

            // Table parsing check
            if (trimmed.startsWith('|')) {
                flushList(idx);
                inTable = true;
                const cells = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
                tableRows.push(cells.map(c => parseInlineText(c)));
                return;
            } else if (inTable) {
                flushTable(idx);
            }

            // Unordered list parsing check
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                inList = true;
                listItems.push(parseInlineText(trimmed.substring(2)));
                return;
            } else if (inList) {
                flushList(idx);
            }

            // Headers
            if (trimmed.startsWith('### ')) {
                htmlElements.push(<h4 key={idx} style={{ fontSize: '18px', fontWeight: 900, marginTop: '24px', marginBottom: '12px', color: 'var(--color-primary)' }}>{parseInlineText(trimmed.substring(4))}</h4>);
            } else if (trimmed.startsWith('## ')) {
                htmlElements.push(<h3 key={idx} style={{ fontSize: '22px', fontWeight: 900, marginTop: '32px', marginBottom: '16px', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px' }}>{parseInlineText(trimmed.substring(3))}</h3>);
            } else if (trimmed.startsWith('# ')) {
                htmlElements.push(<h2 key={idx} style={{ fontSize: '28px', fontWeight: 900, marginTop: '16px', marginBottom: '24px', color: 'var(--color-primary)' }}>{parseInlineText(trimmed.substring(2))}</h2>);
            } else if (trimmed.startsWith('> ')) {
                htmlElements.push(
                    <blockquote key={idx} style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '16px', margin: '0 0 20px 0', fontStyle: 'italic', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-light)', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
                        {parseInlineText(trimmed.substring(2))}
                    </blockquote>
                );
            } else if (trimmed === '---') {
                htmlElements.push(<hr key={idx} style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '24px 0' }} />);
            } else if (trimmed.length > 0) {
                htmlElements.push(<p key={idx} style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: parseInlineText(trimmed) }} />);
            }
        });

        // Flush any remaining active lists/tables at end of document
        flushList(lines.length);
        flushTable(lines.length);

        return htmlElements;
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([markdown], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="button-secondary" onClick={handleDownload} style={{ borderRadius: '12px', fontSize: '14px', padding: '8px 16px', minHeight: '38px' }}>
                    <Download size={16} />
                    Download Markdown File (.md)
                </button>
            </div>

            {/* Document Frame styling matching Perplexity theme */}
            <div className="markdown-doc-frame" style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border-light)',
                borderRadius: '24px',
                padding: '40px',
                textAlign: 'left',
                boxShadow: 'var(--elevation-card)',
                fontFamily: 'var(--typography-body-family)',
                maxHeight: '600px',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-light-muted)', fontSize: '13px', marginBottom: '24px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
                    <FileText size={16} />
                    <span>{filename}</span>
                </div>
                {parseMarkdown(markdown)}
            </div>
        </div>
    );
}
