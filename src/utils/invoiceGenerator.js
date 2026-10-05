import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // 💎 DESIGN SYSTEM: MATTE OBSIDIAN & LUXE GOLD
    const colorObsidian = [15, 23, 42]; // #0f172a
    const colorGold = [251, 191, 36];   // #fbbf24 (Lighter gold for tech feel)
    const colorSlate = [100, 116, 139]; // #64748b
    const colorSnow = [248, 250, 252];  // #f8fafc

    // Helper: Header Rectangle
    doc.setFillColor(...colorObsidian);
    doc.rect(0, 0, 210, 45, 'F');

    // --- BRANDING ---
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("KUIKY", 15, 25);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text("QUICK HELP, ANYTIME • DIGITAL LOGISTICS HUB", 15, 32);

    // --- MANIFEST INFO ---
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL INVOICE", 195, 23, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colorGold);
    doc.text(`ID: #${(order.id || order.orderId || "M-0001").toUpperCase()}`, 195, 30, { align: 'right' });
    
    doc.setTextColor(200, 200, 200);
    const orderDate = new Date(order.date || order.created_at || new Date()).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(`DATE: ${orderDate.toUpperCase()}`, 195, 35, { align: 'right' });

    // --- DOSSIER SECTOR (BILLING & SHIPPING) ---
    doc.setTextColor(...colorObsidian);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("LOGISTICS DESTINATION / BILLING", 15, 60);
    
    // Draw a subtle border for address
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 63, 195, 63);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colorSlate);
    
    const address = typeof order.address === 'string' 
        ? order.address 
        : (order.address?.full_address || order.address?.address || "SECURE STORE PICKUP");
    const splitAddress = doc.splitTextToSize(address.toUpperCase(), 120);
    doc.text(splitAddress, 15, 70);

    // --- PROCUREMENT TABLE ---
    const items = order.items || order.products || order.order_items || [];
    const tableData = items.map((item, index) => [
        (index + 1).toString().padStart(2, '0'),
        (item.name || item.product_name || "ELITE ASSET").toUpperCase(),
        item.variant_value ? `SIZE: ${item.variant_value.toUpperCase()}` : "STANDARD CONFIG",
        (item.quantity || 1).toString(),
        `₹${(item.price || 0).toLocaleString()}`,
        `₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: 90,
        head: [['SN', 'ASSET DESCRIPTION', 'SPECIFICATION', 'QTY', 'UNIT VALUE', 'NET AMOUNT']],
        body: tableData,
        theme: 'plain',
        headStyles: { 
            fillColor: colorSnow, 
            textColor: colorObsidian, 
            fontStyle: 'bold', 
            fontSize: 8,
            lineWidth: { bottom: 0.5 },
            lineColor: [200, 200, 200]
        },
        styles: { 
            fontSize: 9, 
            cellPadding: 5,
            textColor: colorObsidian,
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 60, fontStyle: 'bold' },
            3: { halign: 'center' },
            4: { halign: 'right' },
            5: { halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 15, right: 15 }
    });

    // --- FINANCIAL SUMMARY ---
    const finalY = (doc.lastAutoTable?.finalY || 150) + 15;
    const subtotal = items.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0);
    
    // Background for total
    doc.setFillColor(...colorSnow);
    doc.rect(130, finalY - 5, 66, 35, 'F');

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colorSlate);
    doc.text("SUBTOTAL EXEMPT:", 135, finalY + 5);
    doc.text(`₹${subtotal.toLocaleString()}`, 190, finalY + 5, { align: 'right' });

    doc.text("LOGISTICS FEE:", 135, finalY + 12);
    doc.setTextColor(...colorSlate);
    doc.text("COMPLIMENTARY", 190, finalY + 12, { align: 'right' });

    doc.setFontSize(11);
    doc.setTextColor(...colorObsidian);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL SETTLEMENT", 135, finalY + 23);
    doc.setTextColor(...colorObsidian);
    doc.text(`₹${subtotal.toLocaleString()}`, 190, finalY + 23, { align: 'right' });

    // --- INSTITUTIONAL FOOTER ---
    doc.setFillColor(...colorSnow);
    doc.rect(0, 275, 210, 22, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(...colorSlate);
    doc.setFont("helvetica", "italic");
    doc.text("This manifest is a digitally authorized secure document and does not require a physical signature.", 105, 282, { align: 'center' });
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorObsidian);
    doc.text("THANK YOU FOR CHOOSING EXCELLENCE • KUIKY NETWORK", 105, 288, { align: 'center' });

    // Output
    doc.save(`KUIKY_OFFICIAL_INVOICE_${(order.id || order.orderId || "TRANS").toUpperCase()}.pdf`);
};
