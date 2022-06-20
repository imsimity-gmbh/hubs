import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Column } from "../layout/Column";
import styles from "./InventoryListContent.scss";

export function InventoryListContent() {
  return (
    <Column className={styles.inventoryContent} padding>
        <div id="inventory-content" style={{width: "100%"}}>
            <ul>
                <li>Waage</li>
                <li>Bunsenbrenner</li>
                <li>Mörserschale + Mörserstab</li>
                <li>Dreifuß mit Auflegeplatte</li>
                <li>Dreifuß mit Auflegedreieck</li>
                <li>Feuerzeug</li>
                <li>Thermometer</li>
                <li>Teigelzange</li>
                <li>Glasstab zum Rühren</li>
                <li>Ausgewählte Bodenprobe</li>
                <li>Tiegel</li>
                <li>Teigelzange</li>
                <li>Löffel für Probe</li>
            </ul>
        </div>
    </Column>
  );
}

InventoryListContent.propTypes = {
  isMobile: PropTypes.bool,
  onClose: PropTypes.func
};