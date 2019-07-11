import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import {Group} from '../model/group.model';
import {Node} from '../model/node.model';
import {Schema} from '../model/schema.model';

import {schemas} from '../../assets/default.schema';

@Injectable()
export class SchemaService {

  loadSchema(schemaName = 'default'): Observable<Schema> {
    console.log('loadSchema');
    const rawSchema = schemas.find(schema => schema.name === schemaName) || schemas[0];
    const preprocessed = this.preprocessSchema(rawSchema);
    console.log('preprocessed:', preprocessed);
    const parsed = this.parseSchema(preprocessed);
    console.log('parsed:', parsed);
    return Observable.of(parsed);
  }

  private preprocessSchema(json) {
    json.items.forEach(item => {
      if (item.type === 'group') {
        // generate nodes from nodeTemplate
        const template = JSON.stringify(item.nodeTemplate);
        if (template) {
          if (json.variants) {
            item.nodes = item.nodes.concat(this.processVariants(item, template, json.variants));
          } else if (json.variantRange) {
            item.nodes = item.nodes.concat(this.processVariantRange(item, template, json.variantRange));
          }
        }
      } else if (item.type === 'node') {
        const template = JSON.stringify(item.dependencyTemplate);
        if (template) {
          if (json.variantRange) {
            item.dependencies = item.dependencies.concat(this.processVariantRange(item, template, json.variantRange));
          }
        }
      }
    });
    return json;
  }

  private processVariants(item, template, variants) {
    // generate node for each variant
    const nodes = [];
    variants.forEach(variant => {
      let copy = template;
      Object.keys(variant).forEach(key => {
        const regex = new RegExp('{' + key + '}', 'g');
        copy = copy.replace(regex, variant[key]);
      });
      nodes.push(JSON.parse(copy));
    });
    return nodes;
  }

  private processVariantRange(item, template, variantRange) {
    // generate node for each # in range
    const nodes = [];
    for (let n = variantRange[0]; n <= variantRange[1]; n++) {
      const regex = new RegExp('{\\#}', 'g');
      const copy = template.replace(regex, n + '');
      // console.log('range #' + n + ': copy=' + copy + ', regex=', regex);
      nodes.push(JSON.parse(copy));
    }
    return nodes;
  }

  private parseSchema(json): Schema {
    const schema = new Schema(json.name);
    schema.label = json.label;
    schema.vertical = json.vertical;
    const nodemap = {}; // map of all nodes by name

    json.items.forEach(item => {
      if (item.type === 'group') {
        const group = new Group(schema, item.name, item.label, item.collapsible, item.wrap, item.root);
        item.nodes.forEach(nodeItem => group.nodes.push(this.getNode(nodeItem, nodemap, schema, group)));
        schema.rootItems.push(group);
      } else { // node
        schema.rootItems.push(this.getNode(item, nodemap, schema));
      }
    });

    schema.nodes = Object.values(nodemap);
    return schema;
  }

  private getNode(json, nodemap, schema: Schema, group: Group = null): Node {
    let node = nodemap[json.name];
    if (!node) {
      node = new Node(schema, json.name);
      nodemap[node.name] = node;
    }
    if (!node.label && json.label) {
      // previous time node showed up in schema was only a reference -
      // this is the full definition
      node.isRoot = json.root;
      node.label = json.label;
      node.brand = json.brand;
      node.verificationType = json.verificationType;
      node.verificationUrl = json.verificationUrl;
      node.responseFilter = json.responseFilter;
      node.group = group;
    }
    if (json.dependencies) {
      json.dependencies.forEach(dependency => {
        const dependencyNode = this.getNode(dependency, nodemap, schema);
        node.dependencies.push(dependencyNode);
        dependencyNode.clients.push(node);
      });
    }
    return node;
  }
}
