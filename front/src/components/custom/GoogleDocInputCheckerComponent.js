import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Spinner } from 'react-bootstrap';
import "./GoogleDocInputCheckerComponent.css"

const GoogleDocInputCheckerComponent = ({ link = '', onChange = e => { }, setLink = () => { }, disabled=false }) => {
  const [fileExists, setFileExists] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      setLink('')
    }
    else if (e.key !== 'v' || (e.ctrlKey && e.key === 'v')) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const url = e.clipboardData.getData('text')
    if (validateUrl(url)) {
      setLink(url);
    }

  };

  const handleClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (validateUrl(text)) {
        setLink(text);
      }
    } catch (error) {
      if (error.name === 'NotAllowedError') {
      } else {
        console.error('Failed to read clipboard:', error);
      }
    }

  };

  const validateUrl = (url) => {
    const regex = new RegExp(/^https?:\/\/[^\s]+$/g);
    return regex.test(url)
  }

  useEffect(() => {
    if (link) {
      const headRequest = async () => {
        try {
          const response = await fetch(link, { method: 'HEAD' });
          if (response.ok) {
            setFileExists(true);
          } else {
            setFileExists(false);
          }
        } catch (error) {
          // console.error(error);
          setFileExists(false);
        } finally {
          setLoading(false);
        }
      };
      headRequest();
    }
  }, [link]);

  return (
    <div>
      <InputGroup>
        { !disabled && ( link ?
          (<InputGroup.Prepend onClick={e => { setLink('') }}>
            <InputGroup.Text><i className='bi bi-eraser'></i></InputGroup.Text>
          </InputGroup.Prepend>) : (<InputGroup.Prepend onClick={e => { handleClick(e) }}>
            <InputGroup.Text><i className='bi bi-clipboard'></i></InputGroup.Text>
          </InputGroup.Prepend>))}
        <Form.Control
          autoFocus
          autoComplete='off'
          type='text'
          value={link}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <InputGroup.Append className={`clear ${disabled ? 'disabled':''}`} >
          { disabled ? (
            <InputGroup.Text>
              { link && (<a href={link} target="_blank" rel="noopener noreferrer"><i className='bi bi-box-arrow-up-right'></i></a>) }
            </InputGroup.Text>
          ): 
          (loading ? (
            <InputGroup.Text >
              <Spinner as="span" size='sm' animation='border' />
            </InputGroup.Text>) :
            (<InputGroup.Text>
              <i className={`bi font-weight-bold ${fileExists ? "bi-file-earmark-check text-success" : "bi-file-earmark-x text-warning" } `}></i>
            </InputGroup.Text>))}

        </InputGroup.Append>
      </InputGroup>
    </div>
  );
};

export default GoogleDocInputCheckerComponent;