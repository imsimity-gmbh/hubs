import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Column } from "../../layout/Column";
import styles from "./InventoryListContent.scss";
import { showHoverEffect } from "../../../utils/permissions-utils";
import inv_bunsen_burner from "../../../assets/models/GecoLab/preview/inv_bunsen_burner.png";
import inv_glassstick from "../../../assets/models/GecoLab/preview/inv_glassstick.png";
import inv_lighter from "../../../assets/models/GecoLab/preview/inv_lighter.png";
import inv_spoon from "../../../assets/models/GecoLab/preview/inv_spoon.png";
import inv_thermo from "../../../assets/models/GecoLab/preview/inv_thermo.png";
import inv_tong from "../../../assets/models/GecoLab/preview/inv_tong.png";
import inv_crucible from "../../../assets/models/GecoLab/preview/inv_crucible.png";
import inv_scale from "../../../assets/models/GecoLab/preview/inv_scale.png";
import inv_groundSample from "../../../assets/models/GecoLab/preview/inv_groundSample.png";
import inv_mortar_with_stick from "../../../assets/models/GecoLab/preview/inv_mortar_with_stick.png";
import inv_tripod_with_plate from "../../../assets/models/GecoLab/preview/inv_tripod_with_plate.png";
import inv_tripod_with_triangle from "../../../assets/models/GecoLab/preview/inv_tripod_with_triangle.png";
import { auto } from "@popperjs/core";

export function InventoryListContent() {
  const [bold, setBold] = useState(1);

  return (
    <Column className={styles.inventoryContent} padding>
      <img id="inventory-preview-picture" style={{width: "200px", marginLeft:auto, marginRight:auto}} src={inv_bunsen_burner}></img>
        <div id="inventory-content" style={{width: "100%"}}>
            <ul>
              <li onMouseEnter={event=>changeImagePreview(1)} onClick={event=>changeImagePreview(1)} style={{fontWeight: bold==1 ? 'bold' : 'normal', cursor:'pointer'}}>Bunsenbrenner</li>
              <li onMouseEnter={event=>changeImagePreview(2)} onClick={event=>changeImagePreview(2)} style={{fontWeight: bold==2 ? 'bold' : 'normal', cursor:'pointer'}}>Mörser und Stößel</li>
              <li onMouseEnter={event=>changeImagePreview(3)} onClick={event=>changeImagePreview(3)} style={{fontWeight: bold==3 ? 'bold' : 'normal', cursor:'pointer'}}>Dreifuß mit aufgelegter Ceran-Schutzplatte</li>
              <li onMouseEnter={event=>changeImagePreview(4)} onClick={event=>changeImagePreview(4)} style={{fontWeight: bold==4 ? 'bold' : 'normal', cursor:'pointer'}}>Dreifuß mit aufgelegtem Tondreieck</li>
              <li onMouseEnter={event=>changeImagePreview(5)} onClick={event=>changeImagePreview(5)} style={{fontWeight: bold==5 ? 'bold' : 'normal', cursor:'pointer'}}>Feuerzeug</li>
              <li onMouseEnter={event=>changeImagePreview(6)} onClick={event=>changeImagePreview(6)} style={{fontWeight: bold==6 ? 'bold' : 'normal', cursor:'pointer'}}>Thermometer</li>
              <li onMouseEnter={event=>changeImagePreview(7)} onClick={event=>changeImagePreview(7)} style={{fontWeight: bold==7 ? 'bold' : 'normal', cursor:'pointer'}}>Glasstab zum Rühren</li>
              <li onMouseEnter={event=>changeImagePreview(8)} onClick={event=>changeImagePreview(8)} style={{fontWeight: bold==8 ? 'bold' : 'normal', cursor:'pointer'}}>Ausgewählte Bodenprobe</li>
              <li onMouseEnter={event=>changeImagePreview(9)} onClick={event=>changeImagePreview(9)} style={{fontWeight: bold==9 ? 'bold' : 'normal', cursor:'pointer'}}>Tiegelzange</li>
              <li onMouseEnter={event=>changeImagePreview(10)} onClick={event=>changeImagePreview(10)} style={{fontWeight: bold==10 ? 'bold' : 'normal', cursor:'pointer'}}>Löffel für Probe</li>
              <li onMouseEnter={event=>changeImagePreview(11)} onClick={event=>changeImagePreview(11)} style={{fontWeight: bold==11 ? 'bold' : 'normal', cursor:'pointer'}}>Waage (erscheint im Laufe des Experiments)</li>
              <li onMouseEnter={event=>changeImagePreview(12)} onClick={event=>changeImagePreview(12)} style={{fontWeight: bold==12 ? 'bold' : 'normal', cursor:'pointer'}}>Tiegel (erscheint im Laufe des Experiments)</li>
            </ul>
        </div>
    </Column>
  );

  function changeImagePreview(nummer){
    setBold(nummer);
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
}

InventoryListContent.propTypes = {
  isMobile: PropTypes.bool,
  onClose: PropTypes.func
};