import { useState, forwardRef, Children } from "react";
import { Card, Col, Badge, Form, Row, Dropdown, ButtonGroup, Button, Alert } from "react-bootstrap";
import './TodoListForm.css';
import { SingleDatePicker } from "react-dates";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import regexValidator from "../../libs/regexValidator";

const TodoListForm = ({ setToDos, usuario, labels = [], setLabels = () => { }, addTaskCallback, interesado = [], persona }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [prioridad, setPrioridad] = useState("");
    const [label, setLabel] = useState("");
    const [date, setDate] = useState(null);
    const [focus, setFocus] = useState(false);
    const [interesadoId, setInteresadoId] = useState("");
    const [interesadoName, setInteresadoName] = useState("");
    const [alertMessage, setAlertMessage] = useState(""); // Para controlar la alerta

    const personaId = persona?.id;
    const nombreCompleto = `${persona?.nombre?.trim() || ''} ${persona?.apellido || ''}`.trim();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Verificar si se seleccionó un interesado
        if (!interesadoId) {
            setAlertMessage("¡Debe seleccionar un interesado para guardar la tarea!"); // Mostrar alerta
            return; // No continuar con el submit
        }

        const dateTemp = moment(date).isValid() ? moment(date).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY");
        const newTodo = { id: uuidv4(), title, description, prioridad, interesadoName, interesadoId, label, done: false, dueDate: dateTemp };

        if (!addTaskCallback) {
            setToDos(prevTodos => {
                const newTodos = [...prevTodos, newTodo];
                return newTodos.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)).reverse();
            });
        } else {
            addTaskCallback(newTodo);
        }

        cleanForm();
    };

    const cleanForm = () => {
        setTitle('');
        setDescription('');
        setPrioridad('');
        setDate(null);
        setLabel('');

        // Solo limpiar interesado si se ha seleccionado uno
        if (interesadoId) {
            setInteresadoId('');
            setInteresadoName('');
        }
    };

    const enableSubmit = () => {
        return title && description && prioridad && interesadoId;
    };

    const handleCancel = () => {
        cleanForm();
        setAlertMessage(''); // Ocultar la alerta cuando se cancela
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Card className="todo-form">
                {alertMessage && (
                    <Alert variant="danger" onClose={() => setAlertMessage("")} dismissible>
                        {alertMessage}
                    </Alert>
                )}

                <Form.Group controlId="title" className="mb-0">
                    <Form.Control
                        className="col-md-auto"
                        style={{ border: "0px" }}
                        placeholder="Titulo"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className controlId="descripcion">
                    <Form.Control
                        placeholder="Descripcion"
                        type="textarea"
                        value={description}
                        onChange={e => setDescription(e.target.value)} />
                </Form.Group>

                <Card.Footer>
                    <Row className="w-100 d-inline-flex flex-row align-self-center">
                        <Col className="col-md-auto">
                            <SingleDatePicker
                                placeholder='Ingrese La fecha'
                                block={true}
                                date={date}
                                onDateChange={date => setDate(date)}
                                focused={focus}
                                onFocusChange={({ focused }) => { setFocus(focused) }}
                                id={`component-${uuidv4()}`}
                                style={{ fontFamily: 'Open Sans, sans-serif' }}
                            />
                        </Col>

                        <Col className="col-md-auto">
                            <Dropdown as={ButtonGroup} onSelect={value => { setPrioridad(value); }}>
                                <Dropdown.Toggle variant="outline-primary">Prioridad</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey={'L'} active={prioridad === 'L'}><i className="bi bi-flag text-success mr-1"></i>Baja</Dropdown.Item>
                                    <Dropdown.Item eventKey={'M'} active={prioridad === 'M'}><i className="bi bi-flag text-warning mr-1"></i>Media</Dropdown.Item>
                                    <Dropdown.Item eventKey={'H'} active={prioridad === 'H'}><i className="bi bi-flag text-danger mr-1"></i>Alta</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>

                        <Col className="col-md-auto">
                            <Dropdown as={ButtonGroup} onSelect={(value) => {
                                const [id, name] = value.split("|");
                                setInteresadoId(id);
                                setInteresadoName(name);
                            }}>
                                <Dropdown.Toggle variant="outline-primary">
                                    {interesadoName ? `Interesado: ${interesadoName}` : 'Agregar Interesado'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {interesado.length === 0 ? (
                                        <Dropdown.Item
                                            eventKey={`${personaId}|${nombreCompleto}`}
                                            active
                                        >
                                            {nombreCompleto}
                                        </Dropdown.Item>
                                    ) : (
                                        interesado.map((item) => (
                                            <Dropdown.Item
                                                key={item.id}
                                                eventKey={`${item.id}|${item.nombre_interesado}`}
                                            >
                                                {item.nombre_interesado}
                                            </Dropdown.Item>
                                        ))
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>

                        <Col className="col-md-auto">
                            {label ?
                                (<div className="m-1">
                                    <Badge className="badge h-100" variant="secondary" onClick={e => setLabel('')}><i className="bi bi-tag" />
                                        {label}</Badge>
                                </div>) :
                                (<Dropdown as={ButtonGroup} onSelect={value => { setLabel(value); }}>
                                    {/*<Dropdown.Toggle variant="outline-primary">Etiquetas</Dropdown.Toggle>*/}
                                    <Dropdown.Menu as={CustomMenu} labels={labels} setLabels={setLabels}>
                                        {
                                            labels.map((item, idx) => (
                                                <Dropdown.Item key={idx} eventKey={item}>{item}</Dropdown.Item>
                                            ))
                                        }
                                    </Dropdown.Menu>
                                </Dropdown>)}
                        </Col>

                        <Col className="col-md-auto">
                            <Button variant="outline-primary" onClick={handleCancel}>Cancelar</Button>
                        </Col>
                        <Col className="col-md-auto pr-0">
                            <Button type="submit" disabled={!enableSubmit()}>Crear Tarea</Button>
                        </Col>
                    </Row>
                </Card.Footer>
            </Card>
        </Form>
    );
};

// forwardRef for Dropdown component
const CustomMenu = forwardRef(
    ({ children, style, className, 'aria-labelledby': labeledBy, labels, setLabels }, ref) => {
        const [value, setValue] = useState('');
        const [notExists, setNotExists] = useState(null)

        const handleOnChange = (value) => {
            setNotExists(!labels.includes(value));
            setValue(value.trim());
        }

        const handleOnKeyDown = (e) => {
            if (value && notExists && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                setLabels(prev => [...labels, value.toLowerCase()]);
                setValue('');
            }
        }

        return (
            <div ref={ref} style={style} className={className} aria-labelledby={labeledBy}>
                <Form.Control
                    autoFocus
                    className="mx-3 my-2 w-auto"
                    placeholder="Escriba para filtrar..."
                    onChange={e => regexValidator(e, /^[a-z]+$/g, value => handleOnChange(value))}
                    onKeyDown={handleOnKeyDown}
                    value={value}
                />
                <ul className="list-unstyled">
                    {Children.toArray(children).filter(
                        (child) => {
                            return !value || child.props.children.toLowerCase().startsWith(value);
                        },
                    )}
                </ul>
            </div>
        );
    }
);

export default TodoListForm;
