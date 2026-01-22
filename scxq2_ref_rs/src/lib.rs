use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pack {
    pub v: String,
    pub dict: Vec<String>,
    pub docs: Vec<DocEnt>,
    pub edges: Vec<EdgeEnt>,
    pub root: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocEnt {
    pub p: usize,
    pub t: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeEnt {
    pub a: usize,
    pub b: usize,
}

fn extract_includes(raw: &str) -> Vec<String> {
    let re = Regex::new(r"\{\{\s*([^}]+?)\s*\}\}").unwrap();
    re.captures_iter(raw)
        .map(|c| c[1].trim().to_string())
        .collect()
}

pub fn pack(root: &str, docs: &BTreeMap<String, String>) -> Pack {
    let mut dict_set: BTreeSet<String> = BTreeSet::new();
    dict_set.insert(root.to_string());

    for (p, raw) in docs.iter() {
        dict_set.insert(p.clone());
        for inc in extract_includes(raw) {
            dict_set.insert(inc);
        }
    }

    let dict: Vec<String> = dict_set.into_iter().collect();
    let mut idx: BTreeMap<String, usize> = BTreeMap::new();
    for (i, s) in dict.iter().enumerate() {
        idx.insert(s.clone(), i);
    }

    let mut docs_vec: Vec<DocEnt> = docs
        .iter()
        .map(|(p, t)| DocEnt {
            p: *idx.get(p).unwrap(),
            t: t.clone(),
        })
        .collect();
    docs_vec.sort_by_key(|d| d.p);

    let mut edges: Vec<EdgeEnt> = vec![];
    for (p, raw) in docs.iter() {
        let a = *idx.get(p).unwrap();
        for inc in extract_includes(raw) {
            let b = *idx.get(&inc).unwrap();
            edges.push(EdgeEnt { a, b });
        }
    }
    edges.sort_by(|x, y| (x.a, x.b).cmp(&(y.a, y.b)));

    Pack {
        v: "scxq2-ref-1".to_string(),
        dict,
        docs: docs_vec,
        edges,
        root: *idx.get(root).unwrap(),
    }
}

pub fn unpack(pack: &Pack) -> (String, BTreeMap<String, String>) {
    let root = pack.dict[pack.root].clone();
    let mut docs = BTreeMap::new();
    for d in &pack.docs {
        let p = pack.dict[d.p].clone();
        docs.insert(p, d.t.clone());
    }
    (root, docs)
}
