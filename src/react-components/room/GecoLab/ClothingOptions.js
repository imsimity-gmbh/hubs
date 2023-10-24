import React from "react";


export class ClothingOptions extends React.Component {

    render() {
        return(
            <div id={this.props.parentID}>
                <div className="flexWrapper" id="laborkittel-top-row">
                    <h3 className={this.props.clothingOptionClassName} onClick={() => this.props.onCheckOptionCallback(this.props.elementID, 0)}>1</h3>
                    <h3 className={this.props.clothingOptionClassName} onClick={() => this.props.onCheckOptionCallback(this.props.elementID, 1)}>2</h3>
                </div>
                <img className={this.props.clothingWrapperClassName} src={this.props.imgSrc} onClick={() => this.props.onClickWrapperCallback(this.props.elementID)}/>
                <div className="flexWrapper" id="laborkittel-bottom-row">
                    <h3 className={this.props.clothingOptionClassName} onClick={() => this.props.onCheckOptionCallback(this.props.elementID, 2)}>3</h3>
                    <h3 className={this.props.clothingOptionClassName} onClick={() => this.props.onCheckOptionCallback(this.props.elementID, 3)}>4</h3>
                </div>
            </div>
        );
    }
}