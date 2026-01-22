// scxq2b1.rs — SCXQ2 Binary Lane Pack v1 (DICT/FIELD/LANE/EDGE)
// Deterministic, offline, replayable. No execution semantics.

use std::collections::{BTreeMap, BTreeSet};

const MAGIC: &[u8; 8] = b"SCXQ2B1\n";

#[derive(Debug, Clone)]
pub enum Value {
    Str(String),
    U64(u64),
    I64(i64),
    F64(f64),
    Bool(bool),
    Null,
}

#[derive(Debug, Clone)]
pub struct Field {
    pub key: String,
    pub value: Value,
}

#[derive(Debug, Clone)]
pub struct Lane {
    pub name: String,
    pub items: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct Edge {
    pub from: String,
    pub to: String,
}

#[derive(Debug, Clone)]
pub struct Scxq2Doc {
    pub dict_tokens: Vec<String>,
    pub fields: Vec<Field>,
    pub lanes: Vec<Lane>,
    pub edges: Vec<Edge>,
}

fn write_var_u(mut n: u64, out: &mut Vec<u8>) {
    while n >= 0x80 {
        out.push(((n as u8) & 0x7F) | 0x80);
        n >>= 7;
    }
    out.push(n as u8);
}

fn read_var_u(input: &[u8], mut i: usize) -> Result<(u64, usize), String> {
    let mut shift = 0u32;
    let mut val: u64 = 0;
    loop {
        if i >= input.len() {
            return Err("Unexpected EOF varint".into());
        }
        let b = input[i];
        i += 1;
        val |= ((b & 0x7F) as u64) << shift;
        if (b & 0x80) == 0 {
            break;
        }
        shift += 7;
        if shift > 63 {
            return Err("Varint overflow".into());
        }
    }
    Ok((val, i))
}

fn zigzag_i64(n: i64) -> u64 {
    ((n << 1) ^ (n >> 63)) as u64
}

fn unzigzag_i64(n: u64) -> i64 {
    ((n >> 1) as i64) ^ (-((n & 1) as i64))
}

fn write_bytes(b: &[u8], out: &mut Vec<u8>) {
    write_var_u(b.len() as u64, out);
    out.extend_from_slice(b);
}

fn read_bytes(input: &[u8], i: usize) -> Result<(Vec<u8>, usize), String> {
    let (len, mut j) = read_var_u(input, i)?;
    let len = len as usize;
    if j + len > input.len() {
        return Err("Unexpected EOF bytes".into());
    }
    let v = input[j..j + len].to_vec();
    j += len;
    Ok((v, j))
}

fn write_str(s: &str, out: &mut Vec<u8>) {
    write_bytes(s.as_bytes(), out);
}

fn read_str(input: &[u8], i: usize) -> Result<(String, usize), String> {
    let (b, j) = read_bytes(input, i)?;
    let s = String::from_utf8(b).map_err(|_| "Invalid UTF-8 string".to_string())?;
    Ok((s, j))
}

pub fn pack(doc: &Scxq2Doc) -> Result<Vec<u8>, String> {
    let mut dict: BTreeSet<String> = BTreeSet::new();
    for t in &doc.dict_tokens {
        dict.insert(t.clone());
    }
    for f in &doc.fields {
        dict.insert(f.key.clone());
        if let Value::Str(s) = &f.value {
            dict.insert(s.clone());
        }
    }
    for l in &doc.lanes {
        dict.insert(l.name.clone());
        for it in &l.items {
            dict.insert(it.clone());
        }
    }
    for e in &doc.edges {
        dict.insert(e.from.clone());
        dict.insert(e.to.clone());
    }

    let dict_vec: Vec<String> = dict.into_iter().collect();
    let mut dict_index: BTreeMap<String, u64> = BTreeMap::new();
    for (i, s) in dict_vec.iter().enumerate() {
        dict_index.insert(s.clone(), i as u64);
    }

    let mut fields_norm: Vec<(u64, u8, Vec<u8>)> = vec![];
    for f in &doc.fields {
        let key_id = *dict_index.get(&f.key).ok_or("Missing dict key")?;
        let mut payload: Vec<u8> = vec![];
        let type_tag: u8 = match &f.value {
            Value::Str(s) => {
                let v_id = *dict_index.get(s).ok_or("Missing dict value")?;
                write_var_u(v_id, &mut payload);
                0
            }
            Value::U64(n) => {
                write_var_u(*n, &mut payload);
                1
            }
            Value::I64(n) => {
                write_var_u(zigzag_i64(*n), &mut payload);
                2
            }
            Value::F64(x) => {
                payload.extend_from_slice(&x.to_le_bytes());
                3
            }
            Value::Bool(b) => {
                payload.push(if *b { 1 } else { 0 });
                4
            }
            Value::Null => 5,
        };
        fields_norm.push((key_id, type_tag, payload));
    }
    fields_norm.sort_by(|a, b| (a.0, a.1, &a.2).cmp(&(b.0, b.1, &b.2)));

    let mut lanes_norm: Vec<(u64, Vec<u64>)> = vec![];
    for l in &doc.lanes {
        let name_id = *dict_index.get(&l.name).ok_or("Missing dict lane name")?;
        let mut items: Vec<u64> = l
            .items
            .iter()
            .map(|s| *dict_index.get(s).ok_or("Missing dict lane item"))
            .collect::<Result<Vec<_>, _>>()?;
        items.sort();
        lanes_norm.push((name_id, items));
    }
    lanes_norm.sort_by(|a, b| a.0.cmp(&b.0).then(a.1.cmp(&b.1)));

    let mut edges_norm: Vec<(u64, u64)> = vec![];
    for e in &doc.edges {
        let f = *dict_index.get(&e.from).ok_or("Missing dict edge from")?;
        let t = *dict_index.get(&e.to).ok_or("Missing dict edge to")?;
        edges_norm.push((f, t));
    }
    edges_norm.sort();

    let mut out: Vec<u8> = vec![];
    out.extend_from_slice(MAGIC);
    out.push(1u8);
    out.push(0u8);
    out.extend_from_slice(&[0u8; 6]);

    out.push(0xD1);
    write_var_u(dict_vec.len() as u64, &mut out);
    for s in &dict_vec {
        write_str(s, &mut out);
    }

    out.push(0xF1);
    write_var_u(fields_norm.len() as u64, &mut out);
    for (key_id, type_tag, payload) in &fields_norm {
        write_var_u(*key_id, &mut out);
        out.push(*type_tag);
        match *type_tag {
            0 | 1 | 2 => {
                write_bytes(payload, &mut out);
            }
            3 => {
                write_var_u(8, &mut out);
                out.extend_from_slice(payload);
            }
            4 => {
                write_var_u(1, &mut out);
                out.push(payload[0]);
            }
            5 => {
                write_var_u(0, &mut out);
            }
            _ => return Err("Unknown type_tag".into()),
        }
    }

    out.push(0xA1);
    write_var_u(lanes_norm.len() as u64, &mut out);
    for (name_id, items) in &lanes_norm {
        write_var_u(*name_id, &mut out);
        write_var_u(items.len() as u64, &mut out);
        for it in items {
            write_var_u(*it, &mut out);
        }
    }

    out.push(0xE1);
    write_var_u(edges_norm.len() as u64, &mut out);
    for (f, t) in &edges_norm {
        write_var_u(*f, &mut out);
        write_var_u(*t, &mut out);
    }

    Ok(out)
}

pub fn unpack(bin: &[u8]) -> Result<Scxq2Doc, String> {
    if bin.len() < 16 {
        return Err("Too short".into());
    }
    if &bin[0..8] != MAGIC {
        return Err("Bad magic".into());
    }
    let ver = bin[8];
    if ver != 1 {
        return Err("Unsupported version".into());
    }
    let mut i = 16usize;

    let mut dict: Vec<String> = vec![];
    let mut fields: Vec<Field> = vec![];
    let mut lanes: Vec<Lane> = vec![];
    let mut edges: Vec<Edge> = vec![];

    while i < bin.len() {
        let tag = bin[i];
        i += 1;
        match tag {
            0xD1 => {
                let (n, mut j) = read_var_u(bin, i)?;
                i = j;
                dict.clear();
                for _ in 0..n {
                    let (s, k) = read_str(bin, i)?;
                    i = k;
                    dict.push(s);
                }
            }
            0xF1 => {
                let (n, mut j) = read_var_u(bin, i)?;
                i = j;
                for _ in 0..n {
                    let (key_id, j2) = read_var_u(bin, i)?;
                    i = j2;
                    if i >= bin.len() {
                        return Err("EOF type_tag".into());
                    }
                    let type_tag = bin[i];
                    i += 1;
                    let (payload, j3) = read_bytes(bin, i)?;
                    i = j3;

                    let key = dict
                        .get(key_id as usize)
                        .ok_or("Bad dict key id")?
                        .clone();
                    let value = match type_tag {
                        0 => {
                            let (vid, _) = read_var_u(&payload, 0)?;
                            let s = dict
                                .get(vid as usize)
                                .ok_or("Bad dict value id")?
                                .clone();
                            Value::Str(s)
                        }
                        1 => {
                            let (v, _) = read_var_u(&payload, 0)?;
                            Value::U64(v)
                        }
                        2 => {
                            let (v, _) = read_var_u(&payload, 0)?;
                            Value::I64(unzigzag_i64(v))
                        }
                        3 => {
                            if payload.len() != 8 {
                                return Err("Bad f64 payload".into());
                            }
                            let mut b = [0u8; 8];
                            b.copy_from_slice(&payload);
                            Value::F64(f64::from_le_bytes(b))
                        }
                        4 => {
                            if payload.len() != 1 {
                                return Err("Bad bool payload".into());
                            }
                            Value::Bool(payload[0] != 0)
                        }
                        5 => Value::Null,
                        _ => return Err("Unknown type_tag".into()),
                    };

                    fields.push(Field { key, value });
                }
            }
            0xA1 => {
                let (n, mut j) = read_var_u(bin, i)?;
                i = j;
                for _ in 0..n {
                    let (name_id, j2) = read_var_u(bin, i)?;
                    i = j2;
                    let (m, j3) = read_var_u(bin, i)?;
                    i = j3;
                    let name = dict
                        .get(name_id as usize)
                        .ok_or("Bad lane name id")?
                        .clone();
                    let mut items: Vec<String> = vec![];
                    for _ in 0..m {
                        let (it, j4) = read_var_u(bin, i)?;
                        i = j4;
                        items.push(dict.get(it as usize).ok_or("Bad lane item id")?.clone());
                    }
                    lanes.push(Lane { name, items });
                }
            }
            0xE1 => {
                let (n, mut j) = read_var_u(bin, i)?;
                i = j;
                for _ in 0..n {
                    let (f, j2) = read_var_u(bin, i)?;
                    i = j2;
                    let (t, j3) = read_var_u(bin, i)?;
                    i = j3;
                    let from = dict.get(f as usize).ok_or("Bad edge from id")?.clone();
                    let to = dict.get(t as usize).ok_or("Bad edge to id")?.clone();
                    edges.push(Edge { from, to });
                }
            }
            _ => return Err(format!("Unknown section tag: {tag:#x}")),
        }
    }

    Ok(Scxq2Doc {
        dict_tokens: dict,
        fields,
        lanes,
        edges,
    })
}
