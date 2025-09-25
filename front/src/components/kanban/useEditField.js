import {
    RefObject,
    useState,
    useRef,
    useEffect,
  } from "react";

const useEditField = ({
  fieldId,
  onCreate,
  onEdit,
  autoFocus = false,
})=>{
  const [field, setField] = useState("");
  const [isEditing, setIsEditing] = useState(autoFocus);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef?.current) inputRef?.current?.focus();
  }, [isEditing, inputRef]);

  const handleCreate = () => {
    if (field.length > 0) {
      onCreate(field);
      setIsEditing(false);
      setField("");
    } else {
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    if (fieldId && field.length > 0) {
      onEdit(fieldId, field);
      setIsEditing(false);
      setField("");
    } else {
      setIsEditing(false);
    }
  };

  const handleChange = (e) =>
    setField(e.target.value);

  const handleBlur = () => {
    if (fieldId) handleEdit();
    else handleCreate();
  };

  const onKeyPressed = (event) => {
    if (event.key === "Enter") {
      if (fieldId) handleEdit();
      else handleCreate();
    }
  };

  return {
    field,
    setField,
    isEditing,
    setIsEditing,
    onKeyPressed,
    handleBlur,
    handleChange,
    inputRef,
  };
}

export default useEditField