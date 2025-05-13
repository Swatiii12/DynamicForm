"use client";
import React, { useState, useEffect } from "react";

type RadioNode = {
  ID: string;
  id: string;
  type: "radio";
  options: string[];
  children: RadioNode[];
  label_val?: string;
  depth?: number;
};

type Data = {
  data: RadioNode[];
};

type SelectedMap = {
  [nodeId: string]: string; // Maps node id to selected option
};

const radioGroupStyles: React.CSSProperties = {
  marginBottom: "20px",
};

const labelStyles: React.CSSProperties = {
  fontWeight: "600",
  marginBottom: "8px",
  display: "block",
};

const radioLabelHorizontalStyles: React.CSSProperties = {
  display: "inline-block",
  marginRight: "20px",
  cursor: "pointer",
  userSelect: "none",
};

const radioLabelVerticalStyles: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  cursor: "pointer",
  userSelect: "none",
};

const containerStyles: React.CSSProperties = {
  fontFamily:
    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, -apple-system, BlinkMacSystemFont, 'Roboto'",
  width: "600px",
  maxHeight: "600px",
  padding: "15px 25px",
  margin: "20px auto",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  backgroundColor: "#fff",
  overflowY: "auto",
};

const nestedContainerStyles: React.CSSProperties = {
  marginLeft: "20px",
  marginTop: "10px",
  borderLeft: "2px solid #eee",
  paddingLeft: "15px",
};

const DynamicForm: React.FC = () => {
  const [formData, setFormData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<SelectedMap>({});

  useEffect(() => {
    fetch("/formData.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load form data");
        return res.json();
      })
      .then((jsonData: Data) => {
        setFormData(jsonData);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const renderRadioGroup = (node: RadioNode) => {
    const selectedOption = selectedOptions[node.id] || "";
    const selectedIndex = node.options.findIndex((opt) => opt === selectedOption);

    // Determine label style based on depth to switch vertical/horizontal layout
    // Horizontal is default (inline), vertical for depth === 2
    const isDepthTwo = node.depth === 2;
    const radioLabelStyle = isDepthTwo
      ? radioLabelVerticalStyles
      : radioLabelHorizontalStyles;

    return (
      <div key={node.id} style={radioGroupStyles}>
        {node.label_val && <label style={labelStyles}>{node.label_val}</label>}
        <div>
          {node.options.map((option) => {
            const inputId = `${node.id}-${option.replace(/\s+/g, "-")}`;
            return (
              <label
                key={option}
                htmlFor={inputId}
                style={radioLabelStyle}
                aria-checked={selectedOption === option}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={node.id}
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => {
                    setSelectedOptions((prev) => {
                      const newSelections = { ...prev, [node.id]: option };

                      const clearDescendants = (n: RadioNode) => {
                        n.children.forEach((child) => {
                          if (newSelections[child.id]) {
                            delete newSelections[child.id];
                          }
                          clearDescendants(child);
                        });
                      };
                      clearDescendants(node);

                      return newSelections;
                    });
                  }}
                />{" "}
                {option}
              </label>
            );
          })}
        </div>

        {/* Render child group corresponding to selected option */}
        {selectedIndex !== -1 &&
          node.children &&
          node.children.length > selectedIndex &&
          node.children[selectedIndex] && (
            <div style={nestedContainerStyles}>
              {renderRadioGroup(node.children[selectedIndex])}
            </div>
          )}
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: "center" }}>Loading form...</div>;
  if (error) return <div style={{ color: "red", textAlign: "center" }}>Error: {error}</div>;
  if (!formData || !formData.data.length) return <div>No form data available.</div>;

  return <form style={containerStyles}>{renderRadioGroup(formData.data[0])}</form>;
};

export default DynamicForm;
