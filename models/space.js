var Space = function (id, name, access, owner) {
    this.id = 'space' + id;
    this.name = name;
    this.access = access;
    this.owner = owner;
    this.members = [owner.id];
}

module.exports = Space;
