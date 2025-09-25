import React from 'react';
import { pdf } from '@react-pdf/renderer';
import moment from 'moment';

export const DownloadPdfButton = ({children,pdfReport,reportPrefix=''}) => {
  const handleDownload = async () => {
    const pdfDoc = pdfReport ;
    const pdfBlob = await pdf(pdfDoc).toBlob();
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportPrefix || null ? `${reportPrefix}_`: ""}${moment().format('YYYYMMDDHHmmss')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div onClick={handleDownload}>
      {children}
    </div>
  );
};
