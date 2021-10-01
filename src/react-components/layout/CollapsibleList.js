import React, { forwardRef, useState, useCallback } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import styles from "./CollapsibleList.scss";
import clsx from "classnames";

export const MenuItem = forwardRef(({ item: { title, items = []}}, ref  ) => {
  const [expanded, setExpanded] = React.useState();
  const hasSubmenu = items.length > 0;
  const renderSubmenu = expanded && hasSubmenu;
  const toggle = React.useCallback(() => setExpanded(!expanded), [expanded]);

  return (
    <li className={clsx("menu-item", { expanded, hasSubmenu })} ref={ref}>
      <div className="menu-item-title" onClick={hasSubmenu ? toggle : null}>
        {title}
      </div>

      {renderSubmenu && <CollapsibleList items={items} />}
    </li>
  );
});

MenuItem.propTypes = {
  item: PropTypes.node
};

export function CollapsibleList({ items }) {
  return (
      <ul className="menu">
        {items.map(item => (
          <MenuItem key={item.title} item={item} />
        ))}
      </ul>
  );
};

CollapsibleList.propTypes = {
  items: PropTypes.node
};
