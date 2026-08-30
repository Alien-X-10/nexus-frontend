import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./CreateProblem.css";

const LANGUAGES = [
    {
        label: "C++",
        value: "c++"
    },
    {
        label: "Java",
        value: "java"
    },
    {
        label: "JavaScript",
        value: "javascript"
    }
];

const createEmptyVisibleTestCase = () => ({
    input: "",
    output: "",
    explanation: ""
});

const createEmptyHiddenTestCase = () => ({
    input: "",
    output: ""
});

const createEmptyLanguageCode = (language) => ({
    language,
    initialCode: ""
});

const createEmptyReferenceCode = (language) => ({
    language,
    completeCode: ""
});


function CreateProblem() {

    const navigate = useNavigate();

    // ==========================================
    // BASIC PROBLEM INFORMATION
    // ==========================================

    const [title, setTitle] = useState("");

    const [description, setDescription] = useState("");

    const [difficulty, setDifficulty] = useState("easy");

    const [tags, setTags] = useState([]);

    const [tagInput, setTagInput] = useState("");


    // ==========================================
    // TEST CASES
    // ==========================================

    const [visibleTestCases, setVisibleTestCases] = useState([
        createEmptyVisibleTestCase()
    ]);

    const [hiddenTestCases, setHiddenTestCases] = useState([
        createEmptyHiddenTestCase()
    ]);


    // ==========================================
    // START CODE
    // ==========================================

    const [startCode, setStartCode] = useState([
        createEmptyLanguageCode("c++"),
        createEmptyLanguageCode("java"),
        createEmptyLanguageCode("javascript")
    ]);


    // ==========================================
    // REFERENCE SOLUTIONS
    // ==========================================

    const [referenceSolution, setReferenceSolution] = useState([
        createEmptyReferenceCode("c++"),
        createEmptyReferenceCode("java"),
        createEmptyReferenceCode("javascript")
    ]);


    // ==========================================
    // UI STATE
    // ==========================================

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // =====================================================
    // TAGS
    // =====================================================

    const addTag = () => {

        const tag = tagInput.trim();

        if (!tag) {
            return;
        }

        if (tags.includes(tag)) {
            setTagInput("");
            return;
        }

        setTags(prev => [
            ...prev,
            tag
        ]);

        setTagInput("");
    };


    const removeTag = (tagToRemove) => {

        setTags(prev =>
            prev.filter(tag => tag !== tagToRemove)
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

    const updateVisibleTestCase = (
        index,
        field,
        value
    ) => {

        setVisibleTestCases(prev => {

            const updated = [...prev];

            updated[index] = {
                ...updated[index],
                [field]: value
            };

            return updated;

        });

    };


    const addVisibleTestCase = () => {

        setVisibleTestCases(prev => [
            ...prev,
            createEmptyVisibleTestCase()
        ]);

    };


    const removeVisibleTestCase = (index) => {

        if (visibleTestCases.length === 1) {
            return;
        }

        setVisibleTestCases(prev =>
            prev.filter((_, i) => i !== index)
        );

    };


    // =====================================================
    // HIDDEN TEST CASES
    // =====================================================

    const updateHiddenTestCase = (
        index,
        field,
        value
    ) => {

        setHiddenTestCases(prev => {

            const updated = [...prev];

            updated[index] = {
                ...updated[index],
                [field]: value
            };

            return updated;

        });

    };


    const addHiddenTestCase = () => {

        setHiddenTestCases(prev => [
            ...prev,
            createEmptyHiddenTestCase()
        ]);

    };


    const removeHiddenTestCase = (index) => {

        if (hiddenTestCases.length === 1) {
            return;
        }

        setHiddenTestCases(prev =>
            prev.filter((_, i) => i !== index)
        );

    };


    // =====================================================
    // START CODE
    // =====================================================

    const updateStartCode = (
        language,
        value
    ) => {

        setStartCode(prev =>
            prev.map(item =>
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
    // REFERENCE SOLUTION
    // =====================================================

    const updateReferenceSolution = (
        language,
        value
    ) => {

        setReferenceSolution(prev =>
            prev.map(item =>
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
    // VALIDATION
    // =====================================================

    const validateForm = () => {

        if (!title.trim()) {
            return "Problem title is required.";
        }

        if (!description.trim()) {
            return "Problem description is required.";
        }

        if (tags.length === 0) {
            return "Add at least one problem tag.";
        }


        for (
            let i = 0;
            i < visibleTestCases.length;
            i++
        ) {

            const testCase = visibleTestCases[i];

            if (!testCase.input.trim()) {
                return `Visible test case ${i + 1}: input is required.`;
            }

            if (!testCase.output.trim()) {
                return `Visible test case ${i + 1}: output is required.`;
            }

            if (!testCase.explanation.trim()) {
                return `Visible test case ${i + 1}: explanation is required.`;
            }

        }


        for (
            let i = 0;
            i < hiddenTestCases.length;
            i++
        ) {

            const testCase = hiddenTestCases[i];

            if (!testCase.input.trim()) {
                return `Hidden test case ${i + 1}: input is required.`;
            }

            if (!testCase.output.trim()) {
                return `Hidden test case ${i + 1}: output is required.`;
            }

        }


        for (const item of startCode) {

            if (!item.initialCode.trim()) {

                const language = LANGUAGES.find(
                    lang => lang.value === item.language
                );

                return `${language?.label || item.language} starter code is required.`;

            }

        }


        for (const item of referenceSolution) {

            if (!item.completeCode.trim()) {

                const language = LANGUAGES.find(
                    lang => lang.value === item.language
                );

                return `${language?.label || item.language} reference solution is required.`;

            }

        }


        return null;

    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        const validationError = validateForm();

        if (validationError) {

            setError(validationError);

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            return;

        }


        const payload = {

            title: title.trim(),

            description: description.trim(),

            difficulty,

            tags,

            visibleTestCases,

            hiddenTestCases,

            startCode,

            referenceSolution

        };


        // try {

        //     setLoading(true);


        //     const response = await fetch(
        //         "http://localhost:3000/problem/create",
        //         {
        //             method: "POST",

        //             credentials: "include",

        //             headers: {
        //                 "Content-Type": "application/json"
        //             },

        //             body: JSON.stringify(payload)
        //         }
        //     );


        //     const data = await response.json().catch(
        //         () => null
        //     );


        //     if (!response.ok) {

        //         throw new Error(
        //             data?.message ||
        //             data?.error ||
        //             (
        //                 typeof data === "string"
        //                     ? data
        //                     : "Failed to create problem."
        //             )
        //         );

        //     }


        //     setSuccess(
        //         "Problem created successfully."
        //     );


        //     setTimeout(() => {

        //         navigate("/admin/problems");

        //     }, 1000);


        // } catch (err) {

        //     console.error(
        //         "Create Problem Error:",
        //         err
        //     );

        //     setError(
        //         err.message ||
        //         "Something went wrong while creating the problem."
        //     );

        // } finally {

        //     setLoading(false);

        // }

        try {

            setLoading(true);


            const response = await api.post(
                "/problem/create",
                payload
            );


            const data = response.data;


            setSuccess(
                "Problem created successfully."
            );


            setTimeout(() => {

                navigate("/admin/problems");

            }, 1000);


        } catch (err) {

            console.error(
                "Create Problem Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Something went wrong while creating the problem."
            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // CANCEL
    // =====================================================

    const handleCancel = () => {

        navigate("/admin/problems");

    };


    return (

        <div className="create-problem-page">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="create-problem-header">

                <div>

                    <div className="create-problem-eyebrow">
                        PROBLEM MANAGEMENT
                    </div>

                    <h1>
                        Create Problem
                        <span>.</span>
                    </h1>

                    <p>
                        Add a new coding problem to your platform.
                    </p>

                </div>


                <button
                    type="button"
                    className="create-problem-back-btn"
                    onClick={handleCancel}
                >
                    ← Back to Problems
                </button>

            </div>


            {/* ==========================================
                ALERTS
            ========================================== */}

            {error && (

                <div className="create-problem-alert error">
                    {error}
                </div>

            )}


            {success && (

                <div className="create-problem-alert success">
                    {success}
                </div>

            )}


            <form
                className="create-problem-form"
                onSubmit={handleSubmit}
            >


                {/* ==========================================
                    BASIC INFORMATION
                ========================================== */}

                <section className="create-problem-section">

                    <div className="section-heading">

                        <div>
                            <h2>
                                Basic Information
                            </h2>

                            <p>
                                Define the core details of the problem.
                            </p>
                        </div>

                    </div>


                    <div className="form-grid">


                        {/* TITLE */}

                        <div className="form-field full">

                            <label>
                                Problem Title
                            </label>

                            <input
                                type="text"
                                value={title}
                                onChange={e =>
                                    setTitle(e.target.value)
                                }
                                placeholder="e.g. Two Sum"
                            />

                        </div>


                        {/* DIFFICULTY */}

                        <div className="form-field">

                            <label>
                                Difficulty
                            </label>

                            <select
                                value={difficulty}
                                onChange={e =>
                                    setDifficulty(e.target.value)
                                }
                            >

                                <option value="easy">
                                    Easy
                                </option>

                                <option value="medium">
                                    Medium
                                </option>

                                <option value="hard">
                                    Hard
                                </option>

                            </select>

                        </div>


                        {/* TAGS */}

                        <div className="form-field">

                            <label>
                                Tags
                            </label>

                            <div className="tag-input-wrapper">

                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e =>
                                        setTagInput(e.target.value)
                                    }
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="e.g. array"
                                />

                                <button
                                    type="button"
                                    onClick={addTag}
                                >
                                    Add
                                </button>

                            </div>


                            <div className="tags-list">

                                {tags.map(tag => (

                                    <div
                                        className="tag-chip"
                                        key={tag}
                                    >

                                        <span>
                                            {tag}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeTag(tag)
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                ))}

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="form-field full">

                            <label>
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={e =>
                                    setDescription(e.target.value)
                                }
                                placeholder="Explain the problem clearly..."
                                rows={9}
                            />

                        </div>

                    </div>

                </section>


                {/* ==========================================
                    VISIBLE TEST CASES
                ========================================== */}

                <section className="create-problem-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Visible Test Cases
                            </h2>

                            <p>
                                These test cases will be visible to users.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="secondary-action-btn"
                            onClick={addVisibleTestCase}
                        >
                            + Add Test Case
                        </button>

                    </div>


                    <div className="test-cases-list">

                        {visibleTestCases.map(
                            (testCase, index) => (

                                <div
                                    className="test-case-card"
                                    key={index}
                                >

                                    <div className="test-case-header">

                                        <div>
                                            Test Case {index + 1}
                                        </div>

                                        {visibleTestCases.length > 1 && (

                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() =>
                                                    removeVisibleTestCase(index)
                                                }
                                            >
                                                Remove
                                            </button>

                                        )}

                                    </div>


                                    <div className="test-case-grid">

                                        <div className="form-field">

                                            <label>
                                                Input
                                            </label>

                                            <textarea
                                                value={testCase.input}
                                                onChange={e =>
                                                    updateVisibleTestCase(
                                                        index,
                                                        "input",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Input"
                                                rows={5}
                                            />

                                        </div>


                                        <div className="form-field">

                                            <label>
                                                Output
                                            </label>

                                            <textarea
                                                value={testCase.output}
                                                onChange={e =>
                                                    updateVisibleTestCase(
                                                        index,
                                                        "output",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Expected output"
                                                rows={5}
                                            />

                                        </div>


                                        <div className="form-field full">

                                            <label>
                                                Explanation
                                            </label>

                                            <textarea
                                                value={testCase.explanation}
                                                onChange={e =>
                                                    updateVisibleTestCase(
                                                        index,
                                                        "explanation",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Explain why this output is correct..."
                                                rows={4}
                                            />

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </section>


                {/* ==========================================
                    HIDDEN TEST CASES
                ========================================== */}

                <section className="create-problem-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Hidden Test Cases
                            </h2>

                            <p>
                                These test cases are used by the judge but are hidden from users.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="secondary-action-btn"
                            onClick={addHiddenTestCase}
                        >
                            + Add Test Case
                        </button>

                    </div>


                    <div className="test-cases-list">

                        {hiddenTestCases.map(
                            (testCase, index) => (

                                <div
                                    className="test-case-card"
                                    key={index}
                                >

                                    <div className="test-case-header">

                                        <div>
                                            Hidden Test Case {index + 1}
                                        </div>

                                        {hiddenTestCases.length > 1 && (

                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() =>
                                                    removeHiddenTestCase(index)
                                                }
                                            >
                                                Remove
                                            </button>

                                        )}

                                    </div>


                                    <div className="test-case-grid">

                                        <div className="form-field">

                                            <label>
                                                Input
                                            </label>

                                            <textarea
                                                value={testCase.input}
                                                onChange={e =>
                                                    updateHiddenTestCase(
                                                        index,
                                                        "input",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Hidden input"
                                                rows={5}
                                            />

                                        </div>


                                        <div className="form-field">

                                            <label>
                                                Output
                                            </label>

                                            <textarea
                                                value={testCase.output}
                                                onChange={e =>
                                                    updateHiddenTestCase(
                                                        index,
                                                        "output",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Expected output"
                                                rows={5}
                                            />

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </section>


                {/* ==========================================
                    STARTER CODE
                ========================================== */}

                <section className="create-problem-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Starter Code
                            </h2>

                            <p>
                                Code shown to users when they open the problem.
                            </p>

                        </div>

                    </div>


                    <div className="language-code-list">

                        {LANGUAGES.map(language => {

                            const code = startCode.find(
                                item =>
                                    item.language === language.value
                            );

                            return (

                                <div
                                    className="code-editor-card"
                                    key={language.value}
                                >

                                    <div className="code-editor-header">

                                        <span>
                                            {language.label}
                                        </span>

                                        <span className="code-editor-badge">
                                            Starter Code
                                        </span>

                                    </div>


                                    <textarea
                                        className="code-textarea"
                                        value={
                                            code?.initialCode || ""
                                        }
                                        onChange={e =>
                                            updateStartCode(
                                                language.value,
                                                e.target.value
                                            )
                                        }
                                        placeholder={
                                            `Enter ${language.label} starter code...`
                                        }
                                        spellCheck="false"
                                    />

                                </div>

                            );

                        })}

                    </div>

                </section>


                {/* ==========================================
                    REFERENCE SOLUTIONS
                ========================================== */}

                <section className="create-problem-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Reference Solutions
                            </h2>

                            <p>
                                Complete solutions used to validate the problem.
                            </p>

                        </div>

                    </div>


                    <div className="language-code-list">

                        {LANGUAGES.map(language => {

                            const solution =
                                referenceSolution.find(
                                    item =>
                                        item.language === language.value
                                );

                            return (

                                <div
                                    className="code-editor-card"
                                    key={language.value}
                                >

                                    <div className="code-editor-header">

                                        <span>
                                            {language.label}
                                        </span>

                                        <span className="code-editor-badge reference">
                                            Reference Solution
                                        </span>

                                    </div>


                                    <textarea
                                        className="code-textarea reference-editor"
                                        value={
                                            solution?.completeCode || ""
                                        }
                                        onChange={e =>
                                            updateReferenceSolution(
                                                language.value,
                                                e.target.value
                                            )
                                        }
                                        placeholder={
                                            `Enter complete ${language.label} solution...`
                                        }
                                        spellCheck="false"
                                    />

                                </div>

                            );

                        })}

                    </div>

                </section>


                {/* ==========================================
                    FORM ACTIONS
                ========================================== */}

                <div className="create-problem-actions">

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="submit-problem-btn"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating Problem..."
                            : "Create Problem"
                        }

                    </button>

                </div>


            </form>

        </div>

    );

}

export default CreateProblem;