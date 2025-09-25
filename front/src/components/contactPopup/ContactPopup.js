import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";
import ConctactWidget from "../contactWidget/ConctactWidget";
import { selectors as contactoSelectors } from "../../reducers/contacto";

import "./ContactPopup.css";
import "../../css/Commons.css";

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import ContactForm from "../contactForm/ContactForm";


function ContactPopup({ success, ...props  }) {
  const ref = useRef();

  useEffect(() => {
    if (success) {
      ref.current.close();
    }
  }, [success]);


  return (
    <Popup
      trigger={<div>{props.children}</div>}
      ref={ref}
      modal
    >
    {close => (
      <ContactForm onClick={close} />
    )}
    </Popup>
  );
}

const mapStateToProps = state => ({
  success: contactoSelectors.getSuccess(state),
});

export default connect(mapStateToProps)(ContactPopup);