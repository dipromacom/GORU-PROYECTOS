import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { onError } from "../libs/errorLib";
import { selectors as batchSelectors, actions as batchActions } from "../reducers/batch";
import { selectors as sessionSelectors } from "../reducers/session";
import { Page, Text, View, Image, Document, StyleSheet, PDFViewer } from "@react-pdf/renderer";

import "../css/Commons.css";
import "./PrintBatch.css";

const blueColor = '#132544';
const greenColor = '#51ca11';
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft:60,
    paddingRight:60,
    lineHeight: 1.5,
    //flexDirection: 'column',
  },

  pageBackground: {
    position: 'absolute',
    display: 'block',
    top: '40%',
    left: '40%',
    width: '50%',
    zindex: '-1'
},

  // REPORT TITLE
  titleContainer:{
    flexDirection: 'column',
    marginTop: 20,
  },
  reportTitle:{
    color: blueColor,
    fontSize: 22,
    textAlign: 'center',
  },

  // REPORT SUBTITLE
  subTitleContainer:{
    flexDirection: 'column',
    marginTop: 6,
  },
  reportSubTitle:{
    color: blueColor,
    fontSize: 16,
    textAlign: 'center',
  },

  // REPORT DESCRIPTION
  descriptionContainer:{
    flexDirection: 'row',
    marginTop: 16,
  },

  description:{
    color: blueColor,
    fontSize: 12,
    textAlign: 'left',
  },

  // TABLE HEADER
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
    borderWidth: 1,
    borderColor: greenColor,
},
  container: {
      flexDirection: 'row',
      borderBottomColor: greenColor,
      backgroundColor: greenColor,
      color: '#fff',
      borderBottomWidth: 1,
      alignItems: 'center',
      height: 24,
      textAlign: 'center',
      fontStyle: 'bold',
      flexGrow: 1,
  },
  numero: {
      width: '20%',
      borderRightColor: blueColor,
      borderRightWidth: 1,
  },
  proyecto: {
      width: '65%',
      borderRightColor: blueColor,
      borderRightWidth: 1,
  },
  puntaje: {
      width: '15%',
  },

  // TABLE ITEM
  row: {
    flexDirection: 'row',
    borderBottomColor: blueColor,
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 24,
    fontStyle: 'bold',
},
  numeroItem: {
      width: '20%',
      textAlign: 'left',
      borderRightColor: blueColor,
      borderRightWidth: 1,
      paddingLeft: 8,
  },
  proyectoItem: {
      width: '65%',
      borderRightColor: blueColor,
      borderRightWidth: 1,
      textAlign: 'left',
      paddingLeft: 8,
  },
  puntajeItem: {
      width: '15%',
      textAlign: 'right',
      paddingRight: 8,
  },

  });


function PrintBatch({ dispatch, details, evaluacionList, usuario }) {
  const { id } = useParams();

  const MyDocument = (prop) => (
    <Document title={`Priorización de Proyectos - Batch ${id}`}>
      <Page size="A4" style={styles.page}>
      <Image src="./Goru-a4.png" style={styles.pageBackground}/>

        <View style={styles.titleContainer}>
          <Text style={styles.reportTitle}>Priorización de Proyectos</Text>
        </View>

        <View style={styles.subTitleContainer}>
          <Text style={styles.reportSubTitle}>Batch - {details.nombre}</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>Descripción: {details.descripcion}</Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.container}>
            <Text style={styles.numero}>Número</Text>
            <Text style={styles.proyecto}>Proyecto</Text>
            <Text style={styles.puntaje}>Puntaje</Text>
          </View>
        </View>

        {
          evaluacionList.map( item => {
            console.log(item.Proyecto.numero)
            return (<View style={styles.row} key={item.id}>
                <Text style={styles.numeroItem}>{item.Proyecto?.numero.substring(0, 5) || ""}</Text>
                <Text style={styles.proyectoItem}>{item.Proyecto.nombre}</Text>
                <Text style={styles.puntajeItem}>{item.peso_total}</Text>
            </View>);
          }

          )
        }

      </Page>
    </Document>
  );

  useEffect(() => {
    function getBatchDetails() {
      if (usuario != null) {
        dispatch(batchActions.getBatchDetails(id, usuario.id));
      }
    }

    getBatchDetails();
  }, [usuario, id])

  return (
    <div className="page-container">
      <hr className="separator" />
      <div className="print-batch">
        <h1 className="orange">Priorización de Proyectos - Imprimir Resultados</h1>

        <br />
        {
          (evaluacionList!= undefined && evaluacionList.length) && 
          <PDFViewer width="1000" height="600" >
            <MyDocument />
          </PDFViewer>
        }
       
        
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  details: batchSelectors.getDeatils(state),
  evaluacionList: batchSelectors.getEvaluacionList(state),
  usuario: sessionSelectors.getUser(state),
});

export default connect(mapStateToProps)(PrintBatch);