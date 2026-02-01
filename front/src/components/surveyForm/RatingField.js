import React from 'react';
import { Form } from 'react-bootstrap';

const RatingField = ({ label, description, value, onChange, field, error }) => {
    return (
        <Form.Group className={`mb-4 p-3 border rounded bg-white shadow-sm ${error ? 'border-danger' : ''}`}>
            <Form.Label className="fw-bold mb-1">
                {label} <span className="text-danger">*</span>
            </Form.Label>
            {description && <p className="text-muted small mb-3">{description}</p>}
            {error && <div className="text-danger small mb-2">{error}</div>}
            <div className="d-flex justify-content-between px-2">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="text-center">
                        <Form.Check
                            type="radio"
                            id={`${field}-${num}`}
                            name={field}
                            label={num}
                            checked={value === num}
                            onChange={() => onChange(field, num)}
                            className="mb-1"
                        />
                        {num === 0 && <div style={{ fontSize: '10px' }}>Nula</div>}
                        {num === 5 && <div style={{ fontSize: '10px' }}>Excelente</div>}
                    </div>
                ))}
            </div>
        </Form.Group>
    );
};

export default RatingField;