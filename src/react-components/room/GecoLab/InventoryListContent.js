import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Column } from "../../layout/Column";
import styles from "./InventoryListContent.scss";
import { showHoverEffect } from "../../../utils/permissions-utils";
import inv_bunsen_burner from "../../../assets/images/icons/inv_bunsen_burner.png";
import inv_glassstick from "../../../assets/images/icons/inv_glassstick.png";
import inv_lighter from "../../../assets/images/icons/inv_lighter.png";
import inv_spoon from "../../../assets/images/icons/inv_spoon.png";
import inv_thermo from "../../../assets/images/icons/inv_thermo.png";
import inv_tong from "../../../assets/images/icons/inv_tong.png";
import inv_crucible from "../../../assets/images/icons/inv_crucible.png";
import inv_scale from "../../../assets/images/icons/inv_scale.png";
import inv_groundSample from "../../../assets/images/icons/inv_groundSample.png";
import inv_mortar_with_stick from "../../../assets/images/icons/inv_mortar_with_stick.png";
import inv_tripod_with_plate from "../../../assets/images/icons/inv_tripod_with_plate.png";
import inv_tripod_with_triangle from "../../../assets/images/icons/inv_tripod_with_triangle.png";
import { faAlignCenter } from "@fortawesome/free-solid-svg-icons";
import { auto } from "@popperjs/core";

export function InventoryListContent() {
  
  return (
    <Column className={styles.inventoryContent} padding>
      <img id="inventory-preview-picture" style={{width: "200px", marginLeft:auto, marginRight:auto}} src={inv_bunsen_burner}></img>
        <div id="inventory-content" style={{width: "100%"}}>
            <ul>
              <li onMouseEnter={event=>changeImagePreview(1)} onClick={event=>changeImagePreview(1)}>Bunsenbrenner</li>
              <li onMouseEnter={event=>changeImagePreview(2)} onClick={event=>changeImagePreview(2)}>Mörser und Stößel</li>
              <li onMouseEnter={event=>changeImagePreview(3)} onClick={event=>changeImagePreview(3)}>Dreifuß mit aufgelegter Ceran-Schutzplatte</li>
              <li onMouseEnter={event=>changeImagePreview(4)} onClick={event=>changeImagePreview(4)}>Dreifuß mit aufgelegtem Tondreieck</li>
              <li onMouseEnter={event=>changeImagePreview(5)} onClick={event=>changeImagePreview(5)}>Feuerzeug</li>
              <li onMouseEnter={event=>changeImagePreview(6)} onClick={event=>changeImagePreview(6)}>Thermometer</li>
              <li onMouseEnter={event=>changeImagePreview(7)} onClick={event=>changeImagePreview(7)}>Glasstab zum Rühren</li>
              <li onMouseEnter={event=>changeImagePreview(8)} onClick={event=>changeImagePreview(8)}>Ausgewählte Bodenprobe</li>
              <li onMouseEnter={event=>changeImagePreview(9)} onClick={event=>changeImagePreview(9)}>Tiegelzange</li>
              <li onMouseEnter={event=>changeImagePreview(10)} onClick={event=>changeImagePreview(10)}>Löffel für Probe</li>
              <li onMouseEnter={event=>changeImagePreview(11)} onClick={event=>changeImagePreview(11)}>Waage (erscheint im Laufe des Experiments)</li>
              <li onMouseEnter={event=>changeImagePreview(12)} onClick={event=>changeImagePreview(12)}>Tiegel (erscheint im Laufe des Experiments)</li>
            </ul>
        </div>
    </Column>
  );
}

function changeImagePreview(nummer){
  switch(nummer){
    case 1:document.getElementById("inventory-preview-picture").src = inv_bunsen_burner; break;
    case 2:document.getElementById("inventory-preview-picture").src = inv_mortar_with_stick; break;
    case 3:document.getElementById("inventory-preview-picture").src = inv_tripod_with_plate; break;
    case 4:document.getElementById("inventory-preview-picture").src = inv_tripod_with_triangle; break;
    case 5:document.getElementById("inventory-preview-picture").src = inv_lighter; break;
    case 6:document.getElementById("inventory-preview-picture").src = inv_thermo; break;
    case 7:document.getElementById("inventory-preview-picture").src = inv_glassstick; break;
    case 8:document.getElementById("inventory-preview-picture").src = inv_groundSample; break;
    case 9:document.getElementById("inventory-preview-picture").src = inv_tong; break;
    case 10:document.getElementById("inventory-preview-picture").src = inv_spoon; break;
    case 11:document.getElementById("inventory-preview-picture").src = inv_scale; break;
    case 12:document.getElementById("inventory-preview-picture").src = inv_crucible; break;
  }
}

InventoryListContent.propTypes = {
  isMobile: PropTypes.bool,
  onClose: PropTypes.func
};