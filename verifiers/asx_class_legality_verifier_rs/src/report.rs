use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Finding {
    pub code: String,
    pub path: String,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct VerificationReport {
    pub ok: bool,
    pub kind: Option<String>,
    pub id: Option<String>,
    pub version: Option<String>,
    pub findings: Vec<Finding>,
}

impl VerificationReport {
    pub fn new() -> Self {
        Self {
            ok: true,
            kind: None,
            id: None,
            version: None,
            findings: vec![],
        }
    }

    pub fn fail(&mut self, code: &str, path: &str, message: &str) {
        self.ok = false;
        self.findings.push(Finding {
            code: code.to_string(),
            path: path.to_string(),
            message: message.to_string(),
        });
    }
}
