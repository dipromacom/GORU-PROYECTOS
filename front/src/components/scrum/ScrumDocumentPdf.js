import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
    title: { fontSize: 16, fontWeight: 'bold', color: '#1e40af', marginBottom: 4 },
    meta: { fontSize: 9, color: '#64748b', marginBottom: 16 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e40af',
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 4,
        marginBottom: 8,
        marginTop: 12,
    },
    paragraph: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
    label: { fontWeight: 'bold', marginBottom: 2 },
    block: {
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 4,
        marginTop: 4,
    },
});

export default function ScrumDocumentPdf({ doc, tipoLabel, estadoLabel, autor, relacion }) {
    const contentLines = String(doc?.contenido || '(Sin contenido)').split('\n');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{doc?.titulo || 'Documento Scrum'}</Text>
                <Text style={styles.meta}>
                    {tipoLabel} · v{doc?.version || '1.0'} · {estadoLabel} · {autor}
                </Text>
                {doc?.descripcion ? (
                    <>
                        <Text style={styles.sectionTitle}>Descripción</Text>
                        <Text style={styles.paragraph}>{doc.descripcion}</Text>
                    </>
                ) : null}
                <Text style={styles.sectionTitle}>Relación</Text>
                <Text style={styles.paragraph}>{relacion || 'Proyecto'}</Text>
                <Text style={styles.sectionTitle}>Contenido</Text>
                <View style={styles.block}>
                    {contentLines.map((line, i) => (
                        <Text key={i} style={styles.paragraph}>{line || ' '}</Text>
                    ))}
                </View>
                {(doc?.archivos || []).length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Archivos adjuntos</Text>
                        {(doc.archivos || []).map((f) => (
                            <Text key={f.id} style={styles.paragraph}>• {f.nombre} ({Math.round((f.size || 0) / 1024)} KB)</Text>
                        ))}
                    </>
                )}
            </Page>
        </Document>
    );
}
