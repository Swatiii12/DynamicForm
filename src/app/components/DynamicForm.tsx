"use client";
import React, { JSX, useState } from "react";

interface FormNode {
  ID: string;
  id: string;
  type: string;
  depth: number;
  index: number;
  isLast: boolean;
  parent: string | null;
  parentId?: string | null;
  options: string[];
  children: FormNode[];
  label_val?: string;
  displayVertical?: boolean;
  collapsed?: boolean;
  isRequired?: boolean;
}

interface DynamicFormProps {
  formData: { data: FormNode[] };
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formData }) => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const handleChange = (id: string, value: string, node: FormNode) => {
    setAnswers((prev) => {
      const updated = { ...prev, [id]: value };

      const clearChildrenAnswers = (n: FormNode) => {
        for (const child of n.children) {
          delete updated[child.id];
          clearChildrenAnswers(child);
        }
      };
      clearChildrenAnswers(node);
      return updated;
    });
  };

  const renderFormNodes = (nodes: FormNode[]): JSX.Element[] => {
    return nodes.map((node) => {
      const shouldRenderChildren = !!answers[node.id];
      return (
        <div
          key={node.id}
          style={{
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "1rem",
            background: "#f9f9f9",
          }}
        >
          {node.label_val && <p style={{ fontWeight: "bold" }}>{node.label_val}</p>}
          <div
            style={{
              display: node.displayVertical ? "block" : "flex",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            {node.options.map((opt) => (
              <label key={opt} style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="radio"
                  name={node.id}
                  value={opt}
                  checked={answers[node.id] === opt}
                  onChange={() => handleChange(node.id, opt, node)}
                  style={{ marginRight: "0.5rem" }}
                />
                {opt}
              </label>
            ))}
          </div>
          {shouldRenderChildren && (
            <div style={{ marginTop: "1rem", marginLeft: "1rem" }}>
              {renderFormNodes(
                node.children.filter((child) => {
                  if (!child.parentId) return false;
                  return true;
                })
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <form>{renderFormNodes(formData.data)}</form>
    </div>
  );
};

export default DynamicForm;
