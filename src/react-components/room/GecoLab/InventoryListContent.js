import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Column } from "../../layout/Column";
import styles from "./InventoryListContent.scss";

export function InventoryListContent() {
  return (
    <Column className={styles.inventoryContent} padding>
        <div id="inventory-content" style={{width: "100%"}}>
            <ul>
                <li>Bunsenbrenner</li>
                <li>Mörser und Stößel</li>
                <li>Dreifuß mit aufgelegter Ceran-Schutzplatte</li>
                <li>Dreifuß mit aufgelegtem Tondreieck</li>
                <li>Feuerzeug</li>
                <li>Thermometer</li>
                <li>Glasstab zum Rühren</li>
                <li>Ausgewählte Bodenprobe</li>
                <li>Tiegelzange</li>
                <li>Löffel für Probe</li>
                <li>Waage (erscheint im Laufe des Experiments)</li>
                <li>Tiegel (erscheint im Laufe des Experiments)</li>
            </ul>
        </div>
    </Column>
  );
}

InventoryListContent.propTypes = {
  isMobile: PropTypes.bool,
  onClose: PropTypes.func
};