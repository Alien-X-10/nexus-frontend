import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

import "./EditProblem.css";

function EditProblem() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [description, setDescription] = useState("");

    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    const [visibleTestCases, setVisibleTestCases] = useState([]);
    const [hiddenTestCases, setHiddenTestCases] = useState([]);

    const [startCode, setStartCode] = useState([
        {
            language: "c++",
            initialCode: ""
        },
        {
            language: "java",
            initialCode: ""
        },
        {
            language: "javascript",
            initialCode: ""
        }
    ]);

    const [referenceSolution, setReferenceSolution] = useState([
        {
            language: "c++",
            completeCode: ""
        },
        {
            language: "java",
            completeCode: ""
        },
        {
            language: "javascript",
            completeCode: ""
        }
    ]);


    // =====================================================
    // FETCH PROBLEM
    // =====================================================

    useEffect(() => {

        const fetchProblem = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(`/problem/problemById/${id}`);

const problem = response.data.problem || response.data;

                // const response = await fetch(
                //     `http://localhost:3000/problem/problemById/${id}`,
                //     {
                //         credentials: "include"
                //     }
                // );

                // const data = await response.json();

                // if (!response.ok) {

                //     throw new Error(
                //         data.message ||
                //         "Failed to load problem"
                //     );

                // }


                // const problem =
                //     data.problem || data;


                setTitle(
                    problem.title || ""
                );

                setDifficulty(
                    problem.difficulty || "Easy"
                );

                setDescription(
                    problem.description || ""
                );

                setTags(
                    problem.tags || []
                );

                setVisibleTestCases(
                    problem.visibleTestCases || []
                );

                setHiddenTestCases(
                    problem.hiddenTestCases || []
                );


                if (
                    problem.startCode &&
                    problem.startCode.length > 0
                ) {

                    setStartCode(
                        problem.startCode
                    );

                }


                if (
                    problem.referenceSolution &&
                    problem.referenceSolution.length > 0
                ) {

                    setReferenceSolution(
                        problem.referenceSolution
                    );

                }

            } catch (err) {

                console.error(
                    "Fetch Problem Error:",
                    err
                );

                setError(
                    err.message ||
                    "Failed to load problem"
                );

            } finally {

                setLoading(false);

            }

        };


        fetchProblem();

    }, [id]);


    // =====================================================
    // TAGS
    // =====================================================

    const addTag = () => {

        const tag =
            tagInput.trim();

        if (!tag) {
            return;
        }

        if (
            tags.some(
                existing =>
                    existing.toLowerCase() ===
                    tag.toLowerCase()
            )
        ) {

            setTagInput("");

            return;

        }

        setTags([
            ...tags,
            tag
        ]);

        setTagInput("");

    };


    const removeTag = (index) => {

        setTags(
            tags.filter(
                (_, i) =>
                    i !== index
            )
        );

    };


    const handleTagKeyDown = (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            addTag();

        }

    };


    // =====================================================
    // VISIBLE TEST CASES
    // =====================================================

    const addVisibleTestCase = () => {

        setVisibleTestCases([
            ...visibleTestCases,
            {
                input: "",
                output: "",
                explanation: ""
            }
        ]);

    };


    const removeVisibleTestCase = (index) => {

        setVisibleTestCases(
            visibleTestCases.filter(
                (_, i) =>
                    i !== index
            )
        );

    };


    const updateVisibleTestCase = (
        index,
        field,
        value
    ) => {

        setVisibleTestCases(
            visibleTestCases.map(
                (testCase, i) =>
                    i === index
                        ? {
                            ...testCase,
                            [field]: value
                        }
                        : testCase
            )
        );

    };


    // =====================================================
    // HIDDEN TEST CASES
    // =====================================================

    const addHiddenTestCase = () => {

        setHiddenTestCases([
            ...hiddenTestCases,
            {
                input: "",
                output: ""
            }
        ]);

    };


    const removeHiddenTestCase = (index) => {

        setHiddenTestCases(
            hiddenTestCases.filter(
                (_, i) =>
                    i !== index
            )
        );

    };


    const updateHiddenTestCase = (
        index,
        field,
        value
    ) => {

        setHiddenTestCases(
            hiddenTestCases.map(
                (testCase, i) =>
                    i === index
                        ? {
                            ...testCase,
                            [field]: value
                        }
                        : testCase
            )
        );

    };


    // =====================================================
    // STARTER CODE
    // =====================================================

    const updateStartCode = (
        language,
        value
    ) => {

        setStartCode(
            startCode.map(
                item =>
                    item.language === language
                        ? {
                            ...item,
                            initialCode: value
                        }
                        : item
            )
        );

    };


    // =====================================================
    // REFERENCE SOLUTIONS
    // =====================================================

    const updateReferenceSolution = (
        language,
        value
    ) => {

        setReferenceSolution(
            referenceSolution.map(
                item =>
                    item.language === language
                        ? {
                            ...item,
                            completeCode: value
                        }
                        : item
            )
        );

    };


    // =====================================================
    // SAVE
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        if (!title.trim()) {

            setError(
                "Problem title is required."
            );

            return;

        }


        if (!description.trim()) {

            setError(
                "Problem description is required."
            );

            return;

        }


        if (tags.length === 0) {

            setError(
                "Add at least one tag."
            );

            return;

        }


        if (visibleTestCases.length === 0) {

            setError(
                "Add at least one visible test case."
            );

            return;

        }


        if (hiddenTestCases.length === 0) {

            setError(
                "Add at least one hidden test case."
            );

            return;

        }


        try {

            setSaving(true);


            const response = await fetch(
                `http://localhost:3000/problem/update/${id}`,
                {
                    method: "PUT",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        title:
                            title.trim(),

                        description:
                            description.trim(),

                        difficulty,

                        tags,

                        visibleTestCases,

                        hiddenTestCases,

                        startCode,

                        referenceSolution

                    })

                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update problem"
                );

            }


            setSuccess(
                "Problem updated successfully."
            );


            setTimeout(() => {

                navigate(
                    "/admin/problems"
                );

            }, 1000);


        } catch (err) {

            console.error(
                "Update Problem Error:",
                err
            );

            setError(
                err.message ||
                "Failed to update problem"
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="edit-problem-page">

                <div className="edit-problem-loading">

                    Loading problem...

                </div>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error && !title) {

        return (

            <div className="edit-problem-page">

                <div className="edit-problem-error">

                    <h2>
                        Unable to load problem
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/problems"
                            )
                        }
                    >
                        ← Back to Problems
                    </button>

                </div>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="edit-problem-page">


            {/* HEADER */}

            <div className="edit-problem-header">

                <div>

                    <div className="edit-problem-eyebrow">
                        PROBLEM MANAGEMENT
                    </div>

                    <h1>
                        Edit Problem<span>.</span>
                    </h1>

                    <p>
                        Update the problem and save your changes.
                    </p>

                </div>


                <button
                    className="edit-back-button"
                    onClick={() =>
                        navigate(
                            "/admin/problems"
                        )
                    }
                >
                    ← Back to Problems
                </button>

            </div>


            {/* ERROR */}

            {error && (

                <div className="edit-problem-message error">
                    {error}
                </div>

            )}


            {/* SUCCESS */}

            {success && (

                <div className="edit-problem-message success">
                    {success}
                </div>

            )}


            <form
                className="edit-problem-form"
                onSubmit={handleSubmit}
            >


                {/* ================================================= */}
                {/* BASIC INFORMATION */}
                {/* ================================================= */}

                <section className="edit-section">

                    <div className="edit-section-header">

                        <h2>
                            Basic Information
                        </h2>

                        <p>
                            Problem title, difficulty and description.
                        </p>

                    </div>


                    <div className="edit-field">

                        <label>
                            Problem Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="edit-field">

                        <label>
                            Difficulty
                        </label>

                        <select
                            value={difficulty}
                            onChange={(e) =>
                                setDifficulty(
                                    e.target.value
                                )
                            }
                        >

                            <option value="Easy">
                                Easy
                            </option>

                            <option value="Medium">
                                Medium
                            </option>

                            <option value="Hard">
                                Hard
                            </option>

                        </select>

                    </div>


                    <div className="edit-field">

                        <label>
                            Description
                        </label>

                        <textarea
                            rows="8"
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* TAGS */}

                    <div className="edit-field">

                        <label>
                            Tags
                        </label>


                        <div className="edit-tag-input">

                            <input
                                type="text"
                                value={tagInput}
                                placeholder="Add a tag"
                                onChange={(e) =>
                                    setTagInput(
                                        e.target.value
                                    )
                                }
                                onKeyDown={
                                    handleTagKeyDown
                                }
                            />

                            <button
                                type="button"
                                onClick={addTag}
                            >
                                Add
                            </button>

                        </div>


                        <div className="edit-tags">

                            {tags.map(
                                (tag, index) => (

                                    <span
                                        key={`${tag}-${index}`}
                                        className="edit-tag"
                                    >

                                        {tag}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeTag(
                                                    index
                                                )
                                            }
                                        >
                                            ×
                                        </button>

                                    </span>

                                )
                            )}

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* VISIBLE TEST CASES */}
                {/* ================================================= */}

                <section className="edit-section">

                    <div className="edit-section-header">

                        <div>

                            <h2>
                                Visible Test Cases
                            </h2>

                            <p>
                                Test cases visible to users.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="edit-add-button"
                            onClick={
                                addVisibleTestCase
                            }
                        >
                            + Add Test Case
                        </button>

                    </div>


                    {visibleTestCases.map(
                        (testCase, index) => (

                            <div
                                className="edit-test-case"
                                key={index}
                            >

                                <div className="edit-test-case-header">

                                    <strong>
                                        Test Case {index + 1}
                                    </strong>

                                    <button
                                        type="button"
                                        className="edit-remove-button"
                                        onClick={() =>
                                            removeVisibleTestCase(
                                                index
                                            )
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>


                                <div className="edit-test-grid">

                                    <div>

                                        <label>
                                            Input
                                        </label>

                                        <textarea
                                            rows="4"
                                            value={
                                                testCase.input || ""
                                            }
                                            onChange={(e) =>
                                                updateVisibleTestCase(
                                                    index,
                                                    "input",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <div>

                                        <label>
                                            Output
                                        </label>

                                        <textarea
                                            rows="4"
                                            value={
                                                testCase.output || ""
                                            }
                                            onChange={(e) =>
                                                updateVisibleTestCase(
                                                    index,
                                                    "output",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>


                                <div>

                                    <label>
                                        Explanation
                                    </label>

                                    <textarea
                                        rows="3"
                                        value={
                                            testCase.explanation || ""
                                        }
                                        onChange={(e) =>
                                            updateVisibleTestCase(
                                                index,
                                                "explanation",
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        )
                    )}

                </section>


                {/* ================================================= */}
                {/* HIDDEN TEST CASES */}
                {/* ================================================= */}

                <section className="edit-section">

                    <div className="edit-section-header">

                        <div>

                            <h2>
                                Hidden Test Cases
                            </h2>

                            <p>
                                Test cases used internally by the judge.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="edit-add-button"
                            onClick={
                                addHiddenTestCase
                            }
                        >
                            + Add Test Case
                        </button>

                    </div>


                    {hiddenTestCases.map(
                        (testCase, index) => (

                            <div
                                className="edit-test-case"
                                key={index}
                            >

                                <div className="edit-test-case-header">

                                    <strong>
                                        Hidden Test Case {index + 1}
                                    </strong>

                                    <button
                                        type="button"
                                        className="edit-remove-button"
                                        onClick={() =>
                                            removeHiddenTestCase(
                                                index
                                            )
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>


                                <div className="edit-test-grid">

                                    <div>

                                        <label>
                                            Input
                                        </label>

                                        <textarea
                                            rows="4"
                                            value={
                                                testCase.input || ""
                                            }
                                            onChange={(e) =>
                                                updateHiddenTestCase(
                                                    index,
                                                    "input",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <div>

                                        <label>
                                            Output
                                        </label>

                                        <textarea
                                            rows="4"
                                            value={
                                                testCase.output || ""
                                            }
                                            onChange={(e) =>
                                                updateHiddenTestCase(
                                                    index,
                                                    "output",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </section>


                {/* ================================================= */}
                {/* STARTER CODE */}
                {/* ================================================= */}

                <section className="edit-section">

                    <div className="edit-section-header">

                        <h2>
                            Starter Code
                        </h2>

                        <p>
                            Code shown to users when they open the problem.
                        </p>

                    </div>


                    {startCode.map(
                        (item) => (

                            <div
                                className="edit-code-block"
                                key={item.language}
                            >

                                <label>
                                    {item.language}
                                </label>

                                <textarea
                                    rows="12"
                                    value={
                                        item.initialCode || ""
                                    }
                                    onChange={(e) =>
                                        updateStartCode(
                                            item.language,
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        )
                    )}

                </section>


                {/* ================================================= */}
                {/* REFERENCE SOLUTIONS */}
                {/* ================================================= */}

                <section className="edit-section">

                    <div className="edit-section-header">

                        <h2>
                            Reference Solutions
                        </h2>

                        <p>
                            Official solutions used by the judge.
                        </p>

                    </div>


                    {referenceSolution.map(
                        (item) => (

                            <div
                                className="edit-code-block"
                                key={item.language}
                            >

                                <label>
                                    {item.language}
                                </label>

                                <textarea
                                    rows="12"
                                    value={
                                        item.completeCode || ""
                                    }
                                    onChange={(e) =>
                                        updateReferenceSolution(
                                            item.language,
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        )
                    )}

                </section>


                {/* ================================================= */}
                {/* ACTIONS */}
                {/* ================================================= */}

                <div className="edit-problem-actions">

                    <button
                        type="button"
                        className="edit-cancel-button"
                        onClick={() =>
                            navigate(
                                "/admin/problems"
                            )
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="edit-save-button"
                        disabled={saving}
                    >

                        {saving
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </div>


            </form>

        </div>

    );

}

export default EditProblem;