import configs from "../utils/configs";
import Cookies from "js-cookie";
import { isNullUndefinedOrEmpty } from "../utils/imsimity";

AFRAME.registerSystem('experiment-manager', {
    schema: {},  // System schema. Parses into `this.data`.
  
    init: function () {

        this.experiments = [];

        this._createExperiment = this._createExperiment.bind(this);
        this._deleteExperiment = this._deleteExperiment.bind(this);

        NAF.connection.onConnect(() => {                
            NAF.connection.subscribeToDataChannel("gecolab-create-experiment", this._createExperiment);
            NAF.connection.subscribeToDataChannel("gecolab-delete-experiment", this._deleteExperiment);
        });
    },

    _createExperiment(_, dataType, data)
    {   
        console.log("Reveived event !");
        console.log(data);
        
        this.createExperiment(data);
    },

    _deleteExperiment(_, dataType, data)
    {   
        console.log("Reveived event !");
        console.log(data);

        this.removeExperiment(data.networkId);
    },

    getDataForExperiment(entityNetworkId)
    {
        // TODO: Redo to find with the entityNetworkId
        var index = this.experiments.map(object => object.networkId).indexOf(entityNetworkId);

        if (index == -1)
            return null;
        
        return this.experiments[index];
    },

    // public
    broadcastCreateExperiment(entity, groupCode, position, partId)
    {
        NAF.connection.onConnect(() => {
            NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
                var networkId = NAF.utils.getNetworkId(networkedEl);

                console.log(networkId);

                var data = { networkId: networkId, groupCode: groupCode, position: position, partId: partId };

                NAF.connection.broadcastDataGuaranteed("gecolab-create-experiment", data);

                // For our instance, it will not be broadcasted actually...
                this.createExperiment(data);
            });
        });
    },

    // public
    broadcastRemoveExperiment(entity)
    {
        NAF.connection.onConnect(() => {
            NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
                var networkId = NAF.utils.getNetworkId(networkedEl);

                NAF.connection.broadcastData("gecolab-delete-experiment", { networkId: networkId });

                // For our instance, it will not be broadcasted actually...
                this.removeExperiment(newtorkId);
            });
        });
    },

    // private
    createExperiment(data)
    {
        this.experiments.push(data);
    },

    // private
    removeExperiment(networkId)
    {
        var index = this.experiments.map(object => object.networkId).indexOf(networkId);

        if (index == -1)
            return;

        this.experiments.splice(index, 1);
    },
});