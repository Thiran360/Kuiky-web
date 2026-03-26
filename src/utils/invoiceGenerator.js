import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order) => {
    const doc = new jsPDF();
    const primaryColor = [15, 23, 42]; // #0f172a
    const accentColor = [79, 70, 229]; // #4f46e5

    // Normalize items
    const items = order.items || order.products || order.order_items || [];

    // Brand Header
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("ECOM360 ELITE", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Premium E-commerce Logistics Hub", 14, 28);

    // Invoice Meta
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text("INVOICE MANIFEST", 140, 22);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Manifest ID: #${order.id || order.orderId}`, 140, 28);
    doc.text(`Procurement Date: ${new Date(order.date || order.created_at || new Date()).toLocaleDateString()}`, 140, 33);
    doc.text(`Authorized by: Customer System`, 140, 38);

    // Shipping Section
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 45, 182, 35, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("LOGISTICS DESTINATION:", 20, 55);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    const address = order.address || order.shipping_address || "Institutional Central Distribution";
    const splitAddress = doc.splitTextToSize(address, 100);
    doc.text(splitAddress, 20, 62);

    // Items Table
    const tableData = items.map((item, index) => [
        index + 1,
        item.name || "Elite Material",
        `QTY: ${item.quantity || 1}`,
        `₹${(item.price || 0).toLocaleString()}`,
        `₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: 90,
        head: [['#', 'Asset Description', 'Quantity', 'Unit Value', 'Settlement Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 80 },
            4: { halign: 'right', fontStyle: 'bold' }
        }
    });

    // Summary
    const finalY = (doc.lastAutoTable?.finalY || 150) + 10;
    const subtotal = order.total || items.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Procurement Subtotal:", 140, finalY);
    doc.text(`₹${subtotal.toLocaleString()}`, 180, finalY, { align: 'right' });

    doc.text("Logistics Fee (Priority):", 140, finalY + 7);
    doc.text("FREE", 180, finalY + 7, { align: 'right' });

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL SETTLEMENT:", 140, finalY + 18);
    doc.text(`₹${subtotal.toLocaleString()}`, 180, finalY + 18, { align: 'right' });

    // Footer Pledge
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("This document serves as an official proof of acquisition from Ecom360 Elite Marketplace.", 105, 280, { align: 'center' });
    doc.text("Secure institutional handshake active. Thank you for choosing absolute excellence.", 105, 285, { align: 'center' });

    // Output
    doc.save(`Ecom360_Invoice_${order.id || order.orderId}.pdf`);
};
