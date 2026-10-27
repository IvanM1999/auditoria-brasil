import React from "react";
import ReactMarkdown from "react-markdown";

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      components={{
        h2: ({ node, ...props }) => (
          <h2
            className="font-heading text-xl sm:text-2xl font-bold text-slate-800 mt-8 mb-3 pb-2 border-b border-slate-100"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="font-heading text-base sm:text-lg font-semibold text-sky-700 mt-6 mb-2 flex items-center gap-2"
            {...props}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span {...props} />
          </h3>
        ),
        p: ({ node, ...props }) => (
          <p className="text-slate-600 leading-relaxed mb-3" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-none space-y-2 mb-4 ml-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 ml-1 text-slate-600" {...props} />
        ),
        li: ({ node, ...props }) => {
          const isOrdered = node?.position && node?.parent?.tagName === "ol";
          return (
            <li
              className={`text-slate-600 leading-relaxed ${
                isOrdered ? "" : "flex gap-2.5"
              }`}
              {...props}
            >
              {!isOrdered && (
                <span className="text-sky-400 mt-1.5 shrink-0">•</span>
              )}
              {props.children}
            </li>
          );
        },
        strong: ({ node, ...props }) => (
          <strong className="font-semibold text-slate-800" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic text-slate-500" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-sky-300 pl-4 italic text-slate-500 my-4"
            {...props}
          />
        ),
        hr: () => <hr className="border-slate-100 my-6" />,
        a: ({ node, ...props }) => (
          <a className="text-sky-600 underline hover:text-sky-700" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}