const path = require(`path`)
var axios = require(`axios`)
const crypto = require('crypto')
const port = `34975`

let get = function get(query) {
    query = `http://localhost:${port}/?query=${encodeURIComponent(query)}`
    let data = axios.get(query).then()
    return data;
};



exports.sourceNodes = async ({graphql, boundActionCreators}) => {

    const {createNode} = boundActionCreators
    const query = `
{
  allFilms {
    films {
      title
      id
      director
      producers
    }
  }
  
  allPeople {
    people {
      name
      id
    }
  }
}`

    let data =  await get(query);
    data = data.data.data
    //createNodes(createNode, data.allFilms.films)
    createMainNode(createNode, data)
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>~~~~~~~~~~~~~~~~~~~<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
}

let createMainNode = (createNode, nodes) => {
    // console.log(Object.keys(nodes))
    // Object.keys(nodes).forEach( key =>
    //     Object.keys(nodes[key]).forEach(internalKey =>
    //         createNodes(nodes[key][internalKey])
    //     )
    // )
    Object.keys(nodes).forEach( key => {
        Object.keys(nodes[key]).forEach( internalKey => {
            createNodes(createNode, nodes[key][internalKey], internalKey)
        })
    })
}
let createNodes = (createNode, nodes, key) => {
    nodes.forEach((node) => {
        const jsonNode = JSON.stringify(node)
        let nodeObject = {
            parent: `__SOURCE__`,
            children: [],
            internal: {
                type: key,
                content: jsonNode,
                contentDigest: crypto.createHash('md5').update(jsonNode).digest('hex')
            }
        }

        Object.keys(node).forEach(field => {
            nodeObject[field] = node[field]
        })
        //console.log(nodeObject)
        createNode(nodeObject)
    })
}

exports.createPages = ({graphql, boundActionCreators}) => {
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<~~~~~~~~~~~~~~~~~~~~>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    const {createPage} = boundActionCreators
    return new Promise((resolve, reject) => {
        graphql(`
            query {
              allFilms {
                edges {
                  node {
                    id
                  }
                }
              }
            }
        `).then(result => {
            if (result.errors) {
                reject(result.errors)
            }
            const template2 = path.resolve(__dirname, `../src/components/watch-online/WatchOnline.js`)
            console.log(template2)

            result.data.allFilms.edges.forEach(({node}) => {
                createPage({
                    path: `/watch-online/${node.id}`,
                    component: template2,
                    context: {
                        id: node.id
                    }
                })
            })
            resolve()
        })
    })
}