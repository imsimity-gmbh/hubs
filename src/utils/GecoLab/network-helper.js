import { setTag } from "../../components/tags";

function createId(length) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  
  function userFromPresence(id, presence, mySessionId) 
  {
    const meta = presence.metas[presence.metas.length - 1];
    
    return { id: id, isMe: mySessionId === id, ...meta };
  }
  
  function formatUserArray(users)
  {
    var arr = [];
  
    for(var i = 0; i < users.length; i++)
    {
      if(users[i].presence == "room")
      {
        var data = {
          label: users[i].profile.displayName,
          value: {
            context: users[i].context,
            id: users[i].id,
            isMe: users[i].isMe,
            profile: users[i].profile,
          }
        }
  
        arr.push(data);
      }
    }
  
    return arr;
  }
  

  export function setInteractable(entity, value = true)
  {
    setTag(entity,"isHandCollisionTarget", value);
    setTag(entity,"isHoldable", value);
  }
  
  export function generateGroupCode()
  {
    return createId(6);
  }
  
  export function encodeNetworkId(part, groupCode, position)
  {
    return part + "-" + groupCode + "-" + position + "-" + createId(7);
  }
  
  export function decodeNetworkId(networkId)
  {
    var params = networkId.split("-");
    var data = {};
  
    data.part = params[0];
    data.groupCode = params[1];
    data.position = params[2];
    data.id = params[3];
  
    return data;
  }
  
  export function getNetworkIdFromEl(el)
  {
    var networked = el.components["networked"];
  
    if (networked == null)
    {
      console.error("networked is undefined for " + el.localName);
      return "";
    }
  
    return networked.data.networkId;
  }
  
  
  // a parent searching function, to figure out what's our closest first-experiment-0X, and return the groupCode from this one
  export function getGroupCodeFromParent(entity)
  {
    var data = getExperimentDataFromParent(entity);
  
    if (data == null)
      return null;
  
    return data.groupCode;
  }
  
  export function spawnOrDeleteExperiment(position, groupCode, scene, experiment)
  {
    console.log("Spawning or Deleting Experiment for positon " + position + " " + experiment);

    if (position === "position_01" && experiment === "first-experiment") {
      scene.emit("action_toggle_first_experiment_01", groupCode);
      scene.emit("action_toggle_first_experiment_01_start", groupCode);
    }
    else if (position === "position_02" && experiment === "first-experiment") {
      scene.emit("action_toggle_first_experiment_02", groupCode);
      scene.emit("action_toggle_first_experiment_02_start", groupCode);
    }
    else if (position === "position_01" && experiment === "second-experiment") {
      scene.emit("action_toggle_second_experiment_01", groupCode);
      scene.emit("action_toggle_second_experiment_01_start", groupCode);
    }
    else if (position === "position_02" && experiment === "second-experiment") {
      scene.emit("action_toggle_second_experiment_02", groupCode);
      scene.emit("action_toggle_second_experiment_02_start", groupCode);
    }
  }
  
  export function getUsersFromPresences(presences, sessionId)
  {
    var users = Object.entries(presences).map(([id, presence]) => {
      return userFromPresence(id, presence, sessionId);
    });
  
    users = formatUserArray(users);
  
    return users;
  }
  
  export function getExperimentDataFromParent(entity)
  {
    var parent = null;
  
  
    parent = entity.closest('#first-experiment-wrapper');
  
    if (parent != null)
    {
      return parent.components['first-experiment'].experimentData;
    }
  
    parent = entity.closest('#first-experiment-01-wrapper');
  
    if (parent != null)
    {
      return parent.components['first-experiment-01'].experimentData;
    }
  
    parent = entity.closest('#first-experiment-02-wrapper');
  
    if (parent != null)
    {
      return parent.components['first-experiment-02'].experimentData;
    }
  
    parent = entity.closest('#first-experiment-03-wrapper');
  
    if (parent != null)
    {
      return parent.components['first-experiment-03'].experimentData;
    }
  
    parent = entity.closest('#first-experiment-04-wrapper');
  
    if (parent != null)
    {
      return parent.components['first-experiment-04'].experimentData;
    }
  
    parent = entity.closest('#first-experiment-05-wrapper');
  
    if (parent != null)
    {
      return parent.components['first-experiment-05'].experimentData;
    }
  
    parent = entity.closest('#first-experiment-06-wrapper');
  
    if (parent != null)
    {
      return parent.components['first-experiment-06'].experimentData;
    }


    parent = entity.closest('#second-experiment-wrapper');
  
    if (parent != null)
    {
      return parent.components['second-experiment'].experimentData;
    }
  
    parent = entity.closest('#second-experiment-01-wrapper');
  
    if (parent != null)
    {
      return parent.components['second-experiment-01'].experimentData;
    }

    parent = entity.closest('#second-experiment-02-wrapper');
  
    if (parent != null)
    {
      return parent.components['second-experiment-02'].experimentData;
    }

    parent = entity.closest('#second-experiment-03-wrapper');
  
    if (parent != null)
    {
      return parent.components['second-experiment-03'].experimentData;
    }
    
    return null;
  }
  