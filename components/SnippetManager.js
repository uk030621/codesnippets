"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRef } from "react"; // Import useRef

export default function SnippetManager() {
  const [snippets, setSnippets] = useState([]);
  const [filteredSnippets, setFilteredSnippets] = useState([]); // For filtered results
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const [explanation, setExplanation] = useState("");
  const [code, setCode] = useState("");
  const [editingId, setEditingId] = useState(null);

  const explanationRef = useRef(null); // Create a reference for the explanation texta

  const { data: session } = useSession();

  useEffect(() => {
    fetchSnippets();
  }, []);

  useEffect(() => {
    // Filter snippets dynamically based on searchQuery
    const filtered = snippets.filter(
      (snippet) =>
        snippet.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSnippets(filtered);
  }, [searchQuery, snippets]); // Re-run filter when searchQuery or snippets change

  async function fetchSnippets() {
    const res = await fetch("/api/snippets");
    const data = await res.json();
    setSnippets(data);
    setFilteredSnippets(data); // Ensure the filtered list is populated
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { explanation, code };

    if (editingId) {
      await fetch("/api/snippets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, _id: editingId }),
      });
    } else {
      await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setExplanation("");
    setCode("");
    setEditingId(null);
    fetchSnippets();
  }

  async function handleDelete(_id) {
    await fetch("/api/snippets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    });
    fetchSnippets();
  }

  function handleEdit(snippet) {
    setExplanation(snippet.explanation);
    setCode(snippet.code);
    setEditingId(snippet._id);

    // Ensure the textarea gets focused
    setTimeout(() => {
      if (explanationRef.current) {
        explanationRef.current.focus();
      }
    }, 0);
  }

  function resetForm() {
    setExplanation("");
    setCode("");
    setEditingId(null);
  }

  return (
    <div className="max-w-2xl mx-auto p-3 pt-1">
      <div className="flex justify-end">
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white  px-6 py-2 mt-3 mb-3 rounded-md"
        >
          Log Out
        </button>
      </div>
      <h1 className="text-2xl font-bold  text-left">Code Snippet Library</h1>
      <div className="flex-col items-center justify-center gap-5 font-bold mb-4 mt-2 ">
        <div>Hello {session?.user?.name}!</div>
        <div>
          <span className="font-normal text-sm">
            Email: {session?.user?.email}
          </span>
        </div>
      </div>
      {/* Form for adding/editing snippets */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <textarea
          ref={explanationRef} // Attach the reference
          className="w-full p-2 border rounded"
          placeholder="Enter Code function"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          required
        />
        <textarea
          className="w-full p-2 border rounded font-mono text-sm"
          placeholder="Enter Code Snippet"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <div className="flex flex-wrap gap-4">
          <button className="bg-emerald-500 text-white px-4 py-2 rounded">
            {editingId ? "Update Snippet" : "Save Snippet"}
          </button>
          {/* Search Field */}

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full p-2 border-2 border-red-200 rounded bg-yellow-100"
          />

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Display the snippets in a responsive grid */}
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6">
        {filteredSnippets.map((s) => (
          <div
            key={s._id}
            className="p-4 border rounded bg-white shadow space-y-2"
          >
            <p className="text-sm text-green-700">{s.explanation}</p>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto w-full whitespace-pre-wrap break-words">
              <code>{s.code}</code>
            </pre>
            <div className="flex gap-4 text-sm">
              <button
                onClick={() => handleEdit(s)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(s._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
